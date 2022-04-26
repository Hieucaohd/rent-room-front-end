
const times = [["giây", 1], ["phút", 60], ["giờ", 3600], ["ngày", 86400], ["tuần", 604800], ["tháng", 2592000], ["năm", 31536000]]

export function timeAgo(date:string) {
    const NOW = new Date()

    var diff = Math.round((NOW.getTime() - new Date(date).getTime()) / 1000)
    for (var t = 0; t < times.length; t++) {
        if (diff < times[t][1]) {
            if (t == 0) {
                return "Ngay bây giờ"
            } else {
                diff = Math.round(diff / Number(times[t - 1][1]))
                return diff + " " + times[t - 1][0] + " trước";
            }
        }
    }
}