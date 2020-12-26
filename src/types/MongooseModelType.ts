/* eslint-disable no-unused-vars */
import mongoose, {
  Document,
  DocumentDefinition,
  DocumentQuery,
  FilterQuery,
  Omit,
  Query,
  QueryFindBaseOptions,
  QueryFindOptions,
} from 'mongoose'

export interface MongooseModelType<T extends Document, QueryHelpers = {}>
  extends mongoose.Model<any> {
  base: typeof mongoose;

  /**
   * Finds a single document by its _id field. findById(id) is almost*
   * equivalent to findOne({ _id: id }). findById() triggers findOne hooks.
   * @param id value of _id to query by
   * @param projection optional fields to return
   */
  findById(
    id: any | string | number,
    callback?: (err: any, res: T | null) => void
  ): DocumentQuery<T | null, T, QueryHelpers> & QueryHelpers;

  findById(
    id: any | string | number,
    projection: any,
    callback?: (err: any, res: T | null) => void
  ): DocumentQuery<T | null, T, QueryHelpers> & QueryHelpers;

  findById(
    id: any | string | number,
    projection: any,
    options: { lean: true; autopopulate: Boolean } & Omit<
      QueryFindBaseOptions,
      'lean'
    >,
    callback?: (err: any, res: T | null) => void
  ): Query<DocumentDefinition<T>> & QueryHelpers;

  findById(
    id: any | string | number,
    projection: any,
    options: { autopopulate: Boolean } & QueryFindBaseOptions,
    callback?: (err: any, res: T | null) => void
  ): DocumentQuery<T | null, T, QueryHelpers> & QueryHelpers;

  /**
   * Finds documents.
   * @param projection optional fields to return
   */
  find(
    callback?: (err: any, res: T[]) => void
  ): DocumentQuery<T[], T, QueryHelpers> & QueryHelpers;

  find(
    conditions: FilterQuery<T>,
    callback?: (err: any, res: T[]) => void
  ): DocumentQuery<T[], T, QueryHelpers> & QueryHelpers;

  find(
    conditions: FilterQuery<T>,
    projection?: any | null,
    callback?: (err: any, res: T[]) => void
  ): DocumentQuery<T[], T, QueryHelpers> & QueryHelpers;

  find(
    conditions: FilterQuery<T>,
    projection?: any | null,
    options?: { lean: true; autopopulate?: Boolean } & Omit<
      QueryFindOptions,
      'lean'
    >,
    callback?: (err: any, res: T[]) => void
  ): Query<DocumentDefinition<T>[]> & QueryHelpers;

  find(
    conditions: FilterQuery<T>,
    projection?: any | null,
    options?: { autopopulate?: Boolean } & QueryFindOptions,
    callback?: (err: any, res: T[]) => void
  ): DocumentQuery<T[], T, QueryHelpers> & QueryHelpers;
}
