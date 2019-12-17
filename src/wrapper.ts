import { ObjPathInterface } from './service';

export interface ObjPathWrapInterface {
  has(key: string): boolean;

  get(key: string): any;

  set(key: string, value: any): void;

  del(key: string): void;

  path(key: string): string[];

  value(): any;
}

export class ObjPathWrapper implements ObjPathWrapInterface {
  constructor(private svc: ObjPathInterface, private data: any) {}

  value() {return this.data;}

  set(key: string, value: any): void {this.svc.set(this.data, key, value);}

  get(key: string): any {return this.svc.get(this.data, key);}

  del(key: string): void {this.svc.del(this.data, key);}

  has(key: string): boolean {return this.svc.has(this.data, key);}

  path(key: string): string[] {return this.svc.path(key);}
}
