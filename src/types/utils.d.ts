type DatabaseConstraintError = {
  type: 'unique' | 'check' | 'not null' | 'foreign key' | 'unknown';
  columnName?: string;
  message?: string;
};

type UserIdParam = {
  targetUserId: string;
};

type StoreIdParam = {
  targetStoreId: string;
};
