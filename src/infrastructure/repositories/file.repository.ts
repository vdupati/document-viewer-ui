import { Injectable } from '@angular/core';
import { FileInfo, MIME_TYPE_FOLDER } from '../../models/fileInfo';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Injectable()
export class FileRepository {
    private listFilesUrl = environment.apiUrl + '/gDrive/list-files/';
    private downloadFileUrl = environment.apiUrl + '/gDrive/download-file/';
    private uploadFileUrl = environment.apiUrl + '/gDrive/upload-file';

    constructor(private http: HttpClient) { }

    downloadFile(fileId: string) {
        return this.http.get(this.downloadFileUrl + fileId, {
            responseType: 'blob',
            headers: new HttpHeaders().append('Content-Type', 'application/json')
        });
    }

    getFiles(folderId: string) {
        return this.http
            .get<FileInfo[]>(this.listFilesUrl + folderId)
            .toPromise()
            .then((res) => {
                const files: FileInfo[] = [];
                res.forEach((file) => files.push(FileInfo.fromGoogleFile(file)));
                return files;
            });
    }

    importFile(parentId: string, file: FileInfo, onError: any, onComplete: any, onProgress: any) {
        const contentType = file.Blob.type || 'application/octet-stream';
        const metadata = {
            name: file.Blob.name,
            mimeType: contentType,
            parents: [parentId]
        };

        const formData = new FormData();
        formData.append('files', file.Blob);
        formData.append('metadata', JSON.stringify(metadata));

        return this.http.post(
            this.uploadFileUrl,
            formData)
            .toPromise()
            .then((res) => onComplete(res))
            .catch((res) => onError(res));
    }
}
