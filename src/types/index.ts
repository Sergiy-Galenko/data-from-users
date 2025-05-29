export interface User {
  id: string;
  phone: string;
  name: string;
  password: string;
  apartmentNumber: string;
  floor: string;
}

export interface UsersData {
  admin: {
    phone: string;
    password: string;
  };
  users: User[];
} 