import { Connection } from "mysql2/promise";

export interface Migration {
  name: string;
  timestamp: number;
  up(connection: Connection): Promise<void>;
  down(connection: Connection): Promise<void>;
}
