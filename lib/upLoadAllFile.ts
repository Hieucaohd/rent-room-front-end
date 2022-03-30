import { getDownloadURL, ref, uploadBytesResumable, getMetadata, list } from 'firebase/storage';
import { fStorage } from '../firebase';
import randomkey, { getTypeFile } from './randomkey';

export default function upLoadAllFile(files: { file: File }[], id: string) {
    return Promise.all(
        files.map(async ({ file }) => {
            let uploadTask = null;
            const folderRef = ref(fStorage, `${id}`);
            const folderData = (await list(folderRef)).items;
            while (!uploadTask) {
                let name = randomkey(15) + '.' + getTypeFile(file.name);
                let storageRef = ref(fStorage, `${id}/${name}`);
                if (folderData.length > 0 && folderData.includes(storageRef)) {
                    continue;
                }
                uploadTask = uploadBytesResumable(storageRef, file);
            }
            uploadTask.on('state_changed', (status) => {
                console.log('status:', (status.bytesTransferred / status.totalBytes) * 100);
            });
            return uploadTask.then((res) => {
                return getDownloadURL(res.ref);
            });
        })
    );
}
