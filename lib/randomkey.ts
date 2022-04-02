const randomData = [
    '0',
    '1',
    '2',
    '3',
    '4',
    '5',
    '6',
    '7',
    '8',
    '9',
    'A',
    'B',
    'C',
    'D',
    'E',
    'F',
    'G',
    'H',
    'I',
    'J',
    'K',
    'L',
    'M',
    'N',
    'O',
    'P',
    'Q',
    'R',
    'S',
    'T',
    'U',
    'V',
    'W',
    'X',
    'Y',
    'Z',
    'a',
    'b',
    'c',
    'd',
    'e',
    'f',
    'g',
    'h',
    'i',
    'j',
    'k',
    'l',
    'm',
    'n',
    'o',
    'p',
    'q',
    'r',
    's',
    't',
    'u',
    'v',
    'w',
    'x',
    'y',
    'z',
];

/** trả về chuỗi bất kỳ với độ dài đã chọn
 * @param {number} length chiều dài chuỗi
 * @returns {string} chuỗi được random
 */
export default function randomkey(length: number = 20): string {
    let str = '';
    for (let i = 0; i < length; i++) {
        let ran = Math.floor(Math.random() * randomData.length);
        str += randomData[ran];
    }
    return str;
}

export const getTypeFile = (filename: string) => {
    const fileType = filename.split('.');
    const type = fileType[fileType.length - 1];
    if (type) {
        return type;
    }
    return '';
};
