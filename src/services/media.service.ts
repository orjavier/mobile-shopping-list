import { AxiosError } from 'axios';
import { MediaResponse } from "../dtos";
import apiService from "./api.service";

class MediaService {
  async uploadImage(imageUri: string): Promise<MediaResponse> {
    const formData = new FormData();
    const filename = imageUri.split("/").pop() || "photo.jpg";
    const match = /\.(\w+)$/.exec(filename);
    const type = match ? `image/${match[1]}` : "image/jpeg";

    formData.append("file", {
      uri: imageUri,
      name: filename,
      type,
    } as unknown as Blob);

    try {
      const response = await apiService.post<MediaResponse>("/media/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response;
    } catch (error: unknown) {
      const axiosError = error as AxiosError;
      console.error("Error uploading image:", axiosError.message);
      throw error;
    }
  }
}

export default new MediaService();
