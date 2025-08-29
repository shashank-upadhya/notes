import { IUser } from '../../models/User';

declare global {
  namespace Express {
    interface Request {
      // Allow the user property to be of type IUser or null
      user?: IUser | null;
    }
  }
}