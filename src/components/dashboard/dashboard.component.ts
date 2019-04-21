import { Component, NgZone, OnInit } from '@angular/core';
import { AppContext } from '../../infrastructure/app.context';
import { MatTableDataSource } from '@angular/material/table';
import { FileInfo, MIME_TYPE_FOLDER } from '../../models/fileInfo';
import { BreadCrumbItem } from '../../models/breadCrumbItem';
import { BreadCrumbItemOption, OPTION_NEW_FOLDER, OPTION_UPLOAD_FILES } from '../../models/breadCrumbItemOption';
import { MatDialog } from '@angular/material/dialog';
import { DialogOneInputComponent } from '../dialogoneinput/dialogoneinput.component';
import { DialogOneInputData } from '../../models/dialogOneInputData';
import { MatBottomSheet } from '@angular/material';
import { FilesUploadComponent } from '../filesupload/filesupload.component';
import { environment } from '../../environments/environment';
import { saveAs } from 'file-saver';

@Component({
    selector: 'dashboard',
    templateUrl: './dashboard.component.html',
    styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
    downloadFileUrl = environment.apiUrl + '/gDrive/download-file';
    breadCrumbItems: BreadCrumbItem[] = [];
    dataSource: MatTableDataSource<FileInfo>;
    displayedColumns: string[] = ['icon', 'name', 'modifiedTime', 'size', 'downloadFile'];
    files: FileInfo[] = [];

    constructor(
        private appContext: AppContext,
        private bottomSheet: MatBottomSheet,
        private zone: NgZone,
        public dialog: MatDialog,
    ) {
        this.dataSource = new MatTableDataSource(this.files);
        this.appContext.Session.File.uploadFinished.subscribe(() => {
            this.refresh(this.appContext.Session.BreadCrumb.currentItem.Id);
        });
    }

    browse(file: FileInfo) {
        if (file.IsFolder) {
            this.appContext.Repository.File.getFiles(file.Id)
                .then((res) => {
                    this.zone.run(() => {
                        this.files = res;
                        this.dataSource.data = this.files;
                        this.appContext.Session.BreadCrumb.navigateTo(file.Id, file.Name);
                        this.breadCrumbItems = this.appContext.Session.BreadCrumb.items;
                    });
                });
        }
    }

    createNewFolder() {
        const data: DialogOneInputData = new DialogOneInputData();
        data.DefaultInputText = 'Untitled folder';
        data.Title = 'New folder';
        const dialogRef = this.dialog.open(DialogOneInputComponent, {
            width: '250px',
            data
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                this.appContext.Repository.File.uploadFile(
                    this.appContext.Session.BreadCrumb.currentItem.Id,
                    result)
                    .then(() => {
                        this.refresh(this.appContext.Session.BreadCrumb.currentItem.Id);
                    });
            }

        });
    }

    downloadFile(file: FileInfo) {
        this.appContext.Repository.File.downloadFile(file.Id).subscribe(
            data => {
                console.log(data);
                saveAs(data, file.Name);
            },
            err => {
                console.error(err);
            }
        );
    }

    ngOnInit(): void {
        this.appContext.Session.BreadCrumb.init();
        this.breadCrumbItems = this.appContext.Session.BreadCrumb.items;
        this.refresh('root');
    }

    onSelectedItemChanged($event: BreadCrumbItem) {
        const fileInfo: FileInfo = new FileInfo();
        fileInfo.Id = $event.Id;
        fileInfo.Name = $event.Name;
        fileInfo.MimeType = MIME_TYPE_FOLDER;
        this.browse(fileInfo);
    }

    onSelectedOptionChanged($event: BreadCrumbItemOption) {
        if ($event.Option === OPTION_NEW_FOLDER) {
            this.createNewFolder();
        } else if ($event.Option === OPTION_UPLOAD_FILES) {
            // this.importByUrl();
            this.bottomSheet.open(FilesUploadComponent, { data: $event.Data });
        }
    }

    refresh(fileId: string) {
        this.appContext.Repository.File.getFiles(fileId)
            .then((res) => {
                this.zone.run(() => {
                    this.files = res;
                    this.dataSource.data = this.files;
                });
            });
    }
}
