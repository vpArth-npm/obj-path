import { EscapeService } from 'str-esc';
import { EscapeInterface } from 'str-esc/build/service';

export interface ObjPathInterface {
  has(data: any, key: string): boolean;
  get(data: any, key: string, def?: any): any;
  set(data: any, key: string, value: any): void;
  del(data: any, key: string): void;
  path(key: string): string[];
}

export enum ObjPathFlagEnum {
  SKIP_PROTO_DATA,
}

export class ObjPath implements ObjPathInterface {
  constructor(private separator, private esc: EscapeInterface) {
  }

  static create(separator = '.', escape = '\\') {
    return new ObjPath(separator, new EscapeService(escape));
  }

  has(data: any, key: string | string[]): boolean {
    if (key === undefined || key === null) return false;
    const path = Array.isArray(key) ? key : this.path(key);
    if (path.length === 0 || !data) return false;

    const index = path.shift();

    if (path.length === 0) {
      return this.flags[ObjPathFlagEnum.SKIP_PROTO_DATA] ? data.hasOwnProperty(index) : index in data;
    }

    return this.has(data[index], path);
  }

  get(data: any, key: string | string[], def: any = null): any {
    if (data === undefined) return def;
    if (key === undefined || key === null || key.length === 0) return data;
    if (!data) return def;

    const path = Array.isArray(key) ? key : this.path(key);

    const k = path.shift();

    if (this.flags[ObjPathFlagEnum.SKIP_PROTO_DATA] && !data.hasOwnProperty(k)) {
      return def;
    }

    return this.get(data[k], path, def);
  }

  set(data: any, key: string | string[], value: any): void {
    if (key.length === 0) return;
    const path = Array.isArray(key) ? key : this.path(key);

    const k = path.shift();

    if (path.length === 0) {
      data[k] = value;
      return;
    }

    if (!data[k] ||
      this.flags[ObjPathFlagEnum.SKIP_PROTO_DATA] && !data.hasOwnProperty(k) ||
      typeof data[k] !== 'object') {
      data[k] = {};
    }
    this.set(data[k], path, value);
  }

  del(data: any, key: string | string[]): void {
    if (key.length === 0) {
      for (const k of Object.keys(data)) {
        delete data[k];
      }
      return;
    }
    const path = Array.isArray(key) ? key : this.path(key);
    const last = path.pop();

    let p = data;
    for (const k of path) {
      p = p[k];
      if (!p) return;
    }
    if (Array.isArray(p) && parseInt(last, 10) < p.length) {
      p.splice(+last, 1);
    } else {
      delete p[last];
    }
  }

  path(key: string): string[] {
    return this.esc.split(this.separator, key);
  }

  private flags: { [k in ObjPathFlagEnum]: boolean } = {
    [ObjPathFlagEnum.SKIP_PROTO_DATA]: false,
  };

  public setFlag(option: ObjPathFlagEnum, value: boolean) {
    this.flags[option] = value;
  }
}
