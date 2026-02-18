export interface MediaResponse {
  success: boolean;
  message: string;
  data: {
    public_id: string;
    secure_url: string;
    url: string;
    width: number;
    height: number;
    format: string;
    resource_type: string;
  };
}
