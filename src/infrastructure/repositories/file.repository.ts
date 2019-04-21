import { Injectable } from '@angular/core';
import { FileInfo, MIME_TYPE_FOLDER } from '../../models/fileInfo';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Injectable()
export class FileRepository {
    private listFilesUrl = environment.apiUrl + '/gDrive/list-files';
    private downloadFileUrl = environment.apiUrl + '/gDrive/download-file';
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

    delete(fileId: string) {
        // return gapi.client.drive.files.delete({
        //     fileId
        // });
    }

    downloadFile(fileId: string) {
        return this.http
            .get<FileInfo[]>(this.downloadFileUrl + fileId)
            .toPromise()
            .then((res) => {
                console.log('file downloaded successfully');
            });
    }

    getFiles(folderId: string) {
        return this.http
            .get<FileInfo[]>(this.listFilesUrl)
            .toPromise()
            .then((res) => {
                const files: FileInfo[] = [];
                res.forEach((file) => files.push(FileInfo.fromGoogleFile(file)));
                return files;
            });
    }
}
