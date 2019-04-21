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

    uploadFile(parentId: string, folderName: string) {
        return this.http
            .get<FileInfo[]>(this.uploadFileUrl)
            .toPromise()
            .then((res) => {
                console.log('file uploaded successfully');
            });
    }

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
}
