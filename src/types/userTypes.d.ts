type NewUserRequest = {
  email: string;
  password: string;
  birthday: number;
};

type AuthRequest = {
  email: string;
  password: string;
};

type newAdmin = {
  email: string;
  adminStatus: string;
  elevationStatus: string;
};