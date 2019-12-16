import each from 'jest-each';
import { ObjPath, ObjPathFlagEnum } from './service';

describe('obj-path', () => {
  let svc: ObjPath;
  beforeEach(() => svc = new ObjPath());

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
      const svc    = new ObjPath(sep, '\\');
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
      ]).it('Default: %j is %j for %j; def: %j, sep: %s', (key, expected, obj, def, sep) => {
        const svc    = new ObjPath(sep);
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
});
