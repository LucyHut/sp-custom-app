export interface IRqcProps {
  user: Object;
  msGraphClientFactory: any;
}
export interface AuthComponentProps {
  error: any;
  isAuthenticated: boolean;
  user: Object;
  userData: any;
  msGraphClientFactory: any;
  context: any;
}
export interface ApiComponentProps {
  msGraphClientFactory: any;
  context: any;
}