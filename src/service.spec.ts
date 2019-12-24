import each from 'jest-each';
import ObjPath from '.';
import { ObjPathFlagEnum } from './service';

describe('obj-path', () => {
  let svc: ObjPath;
  beforeEach(() => svc = ObjPath.create());

  describe('get', () => {
    each([
      ['ключ.а', 42, {'ключ': {'а': 42}}, '.'],
      [['ключ', 'а'], 42, {'ключ': {'а': 42}}, '.'],
      ['a.b.c.d', null, {}, '.'],
      ['a.b', 42, {a: {b: 42}}, '.'],
      ['a->b', 42, {a: {b: 42}}, '->'],
      ['a->c', null, {a: {b: 42}}, '->'],
      ['a->b->1', 42, {a: {b: ['a', 42]}}, '->'],
      ['a->b', ['a', 42], {a: {b: ['a', 42]}}, '->'],
      ['a/b/1', 42, {a: {b: ['a', 42]}}, '/'],
      ['a\\.b.c\\.d', 42, {'a.b': {'c.d': 42}}, '.'],
      ['a.b.c.d', null, {'a.b': {'c.d': 42}}, '.'],
      ['a.b.c', null, {a: {b: 42}}, '.'],
      ['a.b.1', 2, {a: {b: [1, 2, 3]}}, '.'],
      ['a.1', 'one', {a: {'1': 'one', '2x': 'two'}}, '.'],
      ['a.2x', 'two', {a: {'1': 'one', '2x': 'two'}}, '.'],

      ['0', 'zero', {'0': 'zero'}, '.'],
      ['0x', 'zero', {'0x': 'zero'}, '.'],
      ['0y', null, {'0x': 'zero'}, '.'],
      ['0', 'zero', ['zero'], '.'],

      ['', {a: {b: 42}}, {a: {b: 42}}, '.'],
      [null, {a: {b: 42}}, {a: {b: 42}}, '.'],
      [undefined, {a: {b: 42}}, {a: {b: 42}}, '.'],
      ['a.length', 2, {a: [3, 4]}, '.'],
    ]).it('%j is %j for %j with %s', (key, expected, obj, sep) => {
      const svc    = ObjPath.create(sep, '\\');
      const actual = svc.get(obj, key);

      expect(actual).toEqual(expected);
    });

    describe('Default values', () => {
      each([
        ['a', 16, {}, 16, '.'],
        ['a.2', 16, {a: [1, 2]}, 16, '.'],
        ['a.b', 16, {a: [1, 2]}, 16, '.'],
        ['a.b', 16, {a: {}}, 16, '.'],
        ['a.b', 16, {a: {b: undefined}}, 16, '.'], // May be undefined is better here
        ['a.b', null, {a: {b: null}}, 16, '.'],
        ['a.b.c', 16, {a: {b: ''}}, 16, '.'],
      ]).it('Default: %j is %j for %j; def: %j, sep: %s', (key, expected, obj, def, sep) => {
        const svc    = ObjPath.create(sep);
        const actual = svc.get(obj, key, def);

        expect(actual).toEqual(expected);
      });
    });
    it('See prototype while enabled', () => {
      const obj = (<any>Object).assign(Object.create({their: 24}), {own: 42});

      expect(svc.get(obj, 'own')).toEqual(42);
      expect(svc.get(obj, 'their')).toEqual(24);

      svc.setFlag(ObjPathFlagEnum.SKIP_PROTO_DATA, true);

      expect(svc.get(obj, 'own')).toEqual(42);
      expect(svc.get(obj, 'their', svc)).toEqual(svc);
    });
  });

  describe('has', () => {
    each([
      [{a: 1}, 'a', true],
      [{a: 1}, 'b', false],
      [{a: {b: 42}}, 'a.b', true],
      [{a: {b: 42}}, 'a.c', false],
      [{a: null}, 'a.b', false],
      [{a: null}, 'a', true],
      [{a: 0}, 'a', true],
      [{a: false}, 'a', true],
      [{a: ''}, 'a', true],
      [{a: undefined}, 'a', true],

      [{'': 42}, '', true],
      [{a: 42}, '', false],
      [{a: 42}, null, false],
      [{a: 42}, undefined, false],
    ]).it('%j[%j] = %j', (src, path, expected) => {
      const actual = svc.has(src, path);

      expect(actual).toBe(expected);
    })
  });

  describe('set', () => {
    each([
      [{a: 42}, '', 7, {a: 42}],
      [{a: 42}, [], 7, {a: 42}],
      [{a: 42}, [''], 7, {a: 42, '': 7}],
      [{}, 'Привет', 'Мир', {'Привет': 'Мир'}],
      [{a: {'Привет': 'мир'}}, 'a.Привет', 'Мир', {a: {'Привет': 'Мир'}}],
      [{a: {'Привет': 'мир'}}, ['a', 'Привет'], 'Мир', {a: {'Привет': 'Мир'}}],

      [{a: {'При.вет': 'мир'}}, ['a', 'При.вет'], 'Мир', {a: {'При.вет': 'Мир'}}],
      [{a: {'При.вет': 'мир'}}, 'a.При\\.вет', 'Мир', {a: {'При.вет': 'Мир'}}],
      [{a: {'При.вет': ['мир']}}, 'a.При\\.вет.0', 'Мир', {a: {'При.вет': ['Мир']}}],
      [{}, 'a.При\\.вет.1', 'Мир', {a: {'При.вет': {'1': 'Мир'}}}],
      [{a: {b: {c: [1]}}}, 'a.k.l.m', 7, {a: {b: {c: [1]}, k: {l: {m: 7}}}}],
      [{a: {b: {c: [1]}}}, 'x.k.l.m', 7, {a: {b: {c: [1]}}, x: {k: {l: {m: 7}}}}],
    ]).it('%j[%j] = %j; result: %j', (obj, key, defValue, expected) => {
      svc.set(obj, key, defValue);

      expect(obj).toEqual(expected);
    });
  });

  describe('del', () => {
    each([
      [{a: 12}, '', {}],
      [{}, 'a.b', {}],
      [{x: 'X'}, 'a.b', {x: 'X'}],
      [{a: 12, b: 34}, 'b', {a: 12}],
      [{a: 12, b: {c: 'b:c'}}, 'b.c', {a: 12, b: {}}],
      [{a: 12, c: 2}, 'd.c', {a: 12, c: 2}],
      [{a: 12, b: [3, 4]}, 'b.0', {a: 12, b: [4]}],
      [{a: 12, b: [3]}, 'b.0', {a: 12, b: []}],
      [{a: 12, b: [3, 4]}, 'b.1', {a: 12, b: [3]}],
      [{a: 12, b: [3, 4]}, ['b', '1'], {a: 12, b: [3]}],
      [{a: null, b: undefined}, 'a.x', {a: null, b: undefined}],
      [{a: null, b: undefined}, 'b.x', {a: null, b: undefined}],
      [{a: null, b: undefined}, 'a', {b: undefined}],
      [{a: null, b: undefined}, 'b', {a: null}],
    ]).it('%j[%j] -> %j', (obj, key, expected) => {
      svc.del(obj, key);

      expect(obj).toEqual(expected);
    });
  });

  describe('flags', () => {
    const checkObjProto = (obj) => {
      expect(obj.foreign).toBe('alien');
      expect('foreign' in obj).toBe(true);
      expect(obj.hasOwnProperty('foreign')).toBe(false);

      expect(svc.has(obj, 'foreign')).toBe(true);
      expect(svc.has({obj}, 'obj.foreign')).toBe(true);
      expect(svc.get({obj}, 'obj.foreign')).toBe('alien');

      svc.setFlag(ObjPathFlagEnum.SKIP_PROTO_DATA, true);
      expect(svc.has(obj, 'foreign')).toBe(false);
      expect(svc.has({obj}, 'obj.foreign')).toBe(false);
      expect(svc.get({obj}, 'obj.foreign')).toBe(null);
      svc.set({obj}, 'obj.foreign', 'hello');
      expect(svc.get({obj}, 'obj.foreign')).toBe('hello');
      svc.del({obj}, 'obj.foreign');
      expect('foreign' in obj).toBe(true);

      svc.setFlag(ObjPathFlagEnum.SKIP_PROTO_DATA, false);
      expect(svc.has(obj, 'foreign')).toBe(true);
      expect(svc.has({obj}, 'obj.foreign')).toBe(true);
      expect(svc.get({obj}, 'obj.foreign')).toBe('alien');

      svc.set({obj}, 'obj.foreign', 'hello');
      expect(svc.get({obj}, 'obj.foreign')).toBe('hello');
      // Never delete prototype property
      svc.del({obj}, 'obj.foreign');
      expect(svc.get({obj}, 'obj.foreign')).toBe('alien');
      expect('foreign' in obj).toBe(true);
    };

    it('Object.create', () => {
      let obj = (<any>Object).create({foreign: 'alien'});
      checkObjProto(obj);

      obj = (<any>Object).create({foreign: 'alien'});
      (<any>Object).assign(obj, {own: 42});
      checkObjProto(obj);
    });

    it('proto', () => {
      const proto = function () {};

      proto.prototype.foreign = 'alien';

      const obj = new proto();
      checkObjProto(obj);

      proto.prototype.foreign = 'alien'; // restore
      (<any>Object).assign(obj, {own: 42});
      checkObjProto(obj);
    });
  });
});
