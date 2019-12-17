import { ObjPathInterface } from './service';
import { ObjPathWrapper } from './wrapper';

describe('Wrapper', () => {
  let svc: ObjPathInterface;
  beforeEach(() => {
    svc = {
      del:  jest.fn(),
      get:  jest.fn(),
      has:  jest.fn(),
      path: jest.fn(),
      set:  jest.fn(),
    };
  });

  it('methods are called', () => {
    const obj  = {a: 42};
    const wrap = new ObjPathWrapper(svc, obj);
    wrap.set('path', 101);
    expect(svc.set).toBeCalledWith(obj, 'path', 101);
    wrap.get('path');
    expect(svc.get).toBeCalledWith(obj, 'path');
    wrap.has('path');
    expect(svc.has).toBeCalledWith(obj, 'path');
    wrap.del('path');
    expect(svc.del).toBeCalledWith(obj, 'path');
    wrap.path('path');
    expect(svc.path).toBeCalledWith('path');

    expect(wrap.value()).toBe(obj);
  });
});
