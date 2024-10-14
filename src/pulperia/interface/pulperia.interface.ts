import { ICoordinates } from './coordinates.interface';

export interface IPulperiaCreate {
  name: string;
  image?: string;
  statusId?: number;
  ownerId?: number;
  creatorId?: number;
  coordinates: ICoordinates;
}

export interface IPulperiaUpdate {
  name?: string;
  statusId?: number;
  ownerId?: number;
  creatorId?: number;
}
