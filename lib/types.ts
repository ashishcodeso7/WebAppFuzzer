// types.ts
export interface Alert {
    pluginId: string;
    name: string;
    risk: 'High' | 'Medium' | 'Low';
    description: string;
    solution: string;
  }
  
  export interface ScanResult {
    _id: string;
    userId: string;
    url: string;
    alerts: Alert[];
    timestamp?: string; // Add if your API returns this
  }