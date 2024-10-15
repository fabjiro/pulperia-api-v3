import { ICoordinates } from './coordinates.interface';

export interface IPulperiaCreate {
  name: string;
  image?: string;
  statusId?: number;
  ownerId?: number;
  creatorId?: number;
  coordinates: ICoordinates;
  inventory?: IIventoryPulperia[];
}

export interface IIventoryPulperia {
  categoryId: number;
  products: number[];
}

export interface IPulperiaUpdate {
  name?: string;
  statusId?: number;
  ownerId?: number;
  creatorId?: number;
}
