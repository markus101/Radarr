import ModelBase from 'App/ModelBase';
import { QualityModel } from 'Quality/Quality';
import CustomFormat from 'typings/CustomFormat';
import MediaInfo from 'typings/MediaInfo';

export interface MovieFile extends ModelBase {
  movieId: number;
  relativePath: string;
  path: string;
  size: number;
  dateAdded: string;
  sceneName: string;
  releaseGroup: string;
  languages: CustomFormat[];
  quality: QualityModel;
  customFormats: CustomFormat[];
  mediaInfo: MediaInfo;
  qualityCutoffNotMet: boolean;
}
