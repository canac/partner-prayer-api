export interface Partner {
  _id: { $oid: string };
  firstName: string;
  lastName: string;
}

export interface Settings {
  _id: { $oid: string };
  lastCompletedDay: Date;
}

export interface SkippedDay {
  _id: { $oid: string };
  date: Date;
  isSkipped: boolean;
}
