import { Product, User } from './models';

export type AddEditProductMode = 'add' | 'edit';

/** Rotas do Stack Navigator raiz (App.tsx). */
export type RootStackParamList = {
  Login: undefined;
  Main: { user: User } | undefined;
  AddEditProduct: { product?: Product; mode: AddEditProductMode };
};

/** Rotas do Tab Navigator principal (dentro de "Main"). */
export type MainTabParamList = {
  Home: { user?: User } | undefined;
  Products: undefined;
  LowStock: undefined;
};
