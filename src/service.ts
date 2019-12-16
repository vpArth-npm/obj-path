import { EscapeService } from 'str-esc';

export interface ObjPathInterface {
  get(data: any, path: string, def?: any): any;
}

export enum ObjPathFlagEnum {
  SKIP_PROTO_DATA,
}

export class ObjPath implements ObjPathInterface {
  private esc: EscapeService;

  constructor(private separator = '.', private escape = '\\') {
    this.esc = new EscapeService(escape);
  }

  get(data: any, key: string | string[], def: any = null): any {
    if (data === undefined) return def;
    if (key === undefined || key === null || key.length === 0) return data;
    if (!data || !Object.entries(data).length) return def;

    const path = Array.isArray(key) ? key : this.path(key);

    const k = path.shift();

    if (this.flags[ObjPathFlagEnum.SKIP_PROTO_DATA] && !data.hasOwnProperty(k)) {
      return def;
    }

    return this.get(data[k], path, def); //@ts-disable-line TS2538
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

