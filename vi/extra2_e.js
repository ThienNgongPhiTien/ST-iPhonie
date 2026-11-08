// Phần E: các chuỗi còn sót sau khi quét lần 1
export const EXACT4 = {
  '上个月': 'Tháng trước', '下个月': 'Tháng sau', '本月': 'Tháng này', '按天': 'Theo ngày', '出图': 'Tạo ảnh', '每天': 'Mỗi ngày',
  '这个压缩包里没有主题：要有 theme.json，或者 wallpaper 图片和 icons 文件夹': 'Gói nén này không có chủ đề: cần có theme.json, hoặc ảnh wallpaper và thư mục icons',
  '配色、壁纸和图标都换回默认。现在的样子没存过的话，会先存下来。': 'Bảng màu, hình nền và biểu tượng đều đổi về mặc định. Nếu giao diện hiện tại chưa lưu thì sẽ được lưu trước.',
  '现在的样子': 'Giao diện hiện tại',
  '同一张图换几个参数各画一张，排成一张对比表。': 'Đổi vài tham số trên cùng một ảnh, mỗi giá trị vẽ một ảnh rồi xếp thành bảng so sánh.',
  '5 幅画': '{} bức vẽ',
};
delete EXACT4['5 幅画'];
export const SUBS4 = [
  ['（V5 还不支持），出图时会跳过。换成 V3、V4 或 V4.5 才会生效。', ' (V5 chưa hỗ trợ), khi tạo ảnh sẽ bị bỏ qua. Đổi sang V3, V4 hoặc V4.5 mới có hiệu lực.'],
  
  ['出图时会跳过', 'khi tạo ảnh sẽ bị bỏ qua'],
  ['同一张图换几个参数各画一张，排成一张对比表。', 'Đổi vài tham số trên cùng một ảnh, mỗi giá trị vẽ một ảnh rồi xếp thành bảng so sánh.'],
  ['只有 SFT 模型（比如 CosyVoice-300M-SFT）有预置音色：音色填「中文女」这样的名字。', 'Chỉ mô hình SFT (ví dụ CosyVoice-300M-SFT) mới có giọng có sẵn: ở ô giọng, nhập tên như「中文女」.'],
  ['默认端口 9233。音色填「中文女」这样的名字，或者参考音频在那台电脑上的路径。它不带跨域许可，要开酒馆转发。', 'Cổng mặc định 9233. Ở ô giọng, nhập tên như「中文女」hoặc đường dẫn âm thanh tham chiếu trên máy đó. Nó không có phép CORS nên phải bật chuyển tiếp của Tavern.'],
  
  ['月', '/'],
];
// bỏ mục '月' vì quá chung
SUBS4.pop();
export const TPL4 = [
  ['最多建 5 个相簿', 'Tối đa tạo {} album'],
  ['5 幅画', '{} bức vẽ'],
];
// Phần F: bổ sung sau lần dò lại thứ hai
Object.assign(EXACT4, {
  '開': 'Mở', '拆开红包': 'Mở bao lì xì', '没有锁': 'Chưa khóa',
  '替换现在的': 'Thay cái hiện tại', '加在后面': 'Thêm vào sau', '用这些': 'Dùng những cái này', '加进在用的组': 'Thêm vào nhóm đang dùng',
  '上边往里': 'Cạnh trên: thu vào', '上边往外': 'Cạnh trên: mở ra', '下边往里': 'Cạnh dưới: thu vào', '下边往外': 'Cạnh dưới: mở ra',
  '左边往里': 'Cạnh trái: thu vào', '左边往外': 'Cạnh trái: mở ra', '右边往里': 'Cạnh phải: thu vào', '右边往外': 'Cạnh phải: mở ra',
  '，已保存': ', đã lưu',
});
SUBS4.push(
  ['正在用：', 'Đang dùng: '],
  ['不满意可以从列表换一个，或者', 'Không hài lòng thì đổi một giọng từ danh sách, hoặc '],
  ['在酒馆里打开小手机后', 'sau khi mở điện thoại nhỏ trong quán rượu, '],
  ['都不认。中转地址只填到这些路径前面为止；如果这个中转用的是别的路径，把它的说明发给插件作者。', 'đều không nhận. Địa chỉ trung chuyển chỉ điền đến trước các đường dẫn này; nếu trung chuyển này dùng đường dẫn khác, hãy gửi hướng dẫn của nó cho tác giả plugin.'],
  ['，点一个就能选上', ', bấm một cái là chọn được'],
  ['，已保存', ', đã lưu'],
);
TPL4.push(
  ['📱 群「5」里 5 说了话', '📱 Trong nhóm「{1}」, {2} đã nhắn'],
  ['📱 5 给你发了消息', '📱 {} đã nhắn cho bạn'],
  ['导入了 5 个角色', 'Đã nhập {} nhân vật'],
  ['（5 没找到参考音频）', '({} không tìm thấy âm thanh tham chiếu)'],
  ['读到 5 个模型', 'Đọc được {} mô hình'],
  ['，其中 5 个像 Embedding 模型', ', trong đó {} cái giống mô hình Embedding'],
  ['连接正常。队里现在 5 张', 'Kết nối bình thường. Hàng đợi hiện có {} tấm'],
  ['，5 正在画', ', {} đang vẽ'],
  ['用这张图原来的提示词，以它为底图再画一张：构图和人物大致不变，细节、表情、姿势有变化。', 'Dùng prompt gốc của ảnh này, lấy nó làm ảnh nền vẽ lại 1 tấm: bố cục và nhân vật gần như không đổi, chi tiết, biểu cảm, tư thế có thay đổi.'],
  ['用这张图原来的提示词，以它为底图再画 5 张：构图和人物大致不变，细节、表情、姿势有变化。', 'Dùng prompt gốc của ảnh này, lấy nó làm ảnh nền vẽ lại {} tấm: bố cục và nhân vật gần như không đổi, chi tiết, biểu cảm, tư thế có thay đổi.'],
  ['之前的样子 5月5日 5:5', 'Dáng vẻ trước đó {1}/{2} {3}:{4}'],
);
SUBS4.push(['「重新挑」', '「Chọn lại」']);
// Phần G: thông báo lỗi giọng tự chọn / nguồn nhạc / thu gọn ảnh
SUBS4.push(
  ['Gradio 没有回排队号：检查高级设置里的接口地址', 'Gradio không trả về số thứ tự hàng đợi: kiểm tra địa chỉ giao diện trong cài đặt nâng cao'],
  ['Gradio 没有回排队号：', 'Gradio không trả về số thứ tự hàng đợi: '],
  ['自己的接口（Gradio）出错了', 'Giao diện riêng (Gradio) bị lỗi'],
  ['：看看服务窗口里报了什么；常见原因是有个框没填对，到高级设置的请求体里对一下', ': xem cửa sổ dịch vụ báo gì; nguyên nhân thường gặp là có một ô điền sai, vào nội dung yêu cầu trong cài đặt nâng cao để đối chiếu'],
  ['Gradio 的结果里没有音频：这个接口可能不是出声音的那个，到高级设置里换一个', 'Trong kết quả Gradio không có âm thanh: giao diện này có thể không phải cái ra tiếng, vào cài đặt nâng cao đổi sang cái khác'],
  ['Gradio 的结果读不出来', 'Không đọc được kết quả của Gradio'],
  ['多半是音源后端没登录（或这首要会员）：网易云 API 可以在取歌地址后面加 &cookie=你的登录 cookie；QQ 音乐这类 API 要在它那边登录或填 QQ 的 cookie，具体看那个 API 的说明。没登录时很多歌拿不到链接，会员歌最多只给 30 秒试听', 'Phần lớn là do backend nguồn nhạc chưa đăng nhập (hoặc bài này cần hội viên): với API NetEase có thể thêm &cookie=cookie đăng nhập của bạn sau địa chỉ lấy bài; API kiểu QQ Music phải đăng nhập bên đó hoặc điền cookie QQ, xem mô tả của API đó. Chưa đăng nhập thì nhiều bài không lấy được liên kết, bài hội viên nhiều nhất chỉ cho nghe thử 30 giây'],
  ['音源回答了，但播放链接是空的', 'Nguồn nhạc có trả lời, nhưng liên kết phát bị trống'],
  ['，音源自己说：「', ', nguồn nhạc tự nói: 「'],
  ['；音源自己说：「', '; nguồn nhạc tự nói: 「'],
  ['也可能是这首没有版权（换一首试试），或者音源按请求的 IP 判断地区（网页、手机开了代理、云酒馆的转发，都可能不被当成国内）：网易云 API 的取歌地址加上 &randomCNIP=true 就会用国内 IP 去问，插件遇到网易云这种地址已经自动加上再试过了；这个参数要较新的网易云 API 才认，旧版本要更新', 'Cũng có thể bài này không có bản quyền (thử bài khác), hoặc nguồn nhạc xác định khu vực theo IP yêu cầu (trang web, điện thoại bật proxy, chuyển tiếp của quán rượu đám mây đều có thể không bị coi là trong nước): thêm &randomCNIP=true vào địa chỉ lấy bài của API NetEase thì sẽ dùng IP trong nước để hỏi, plugin gặp địa chỉ NetEase kiểu này đã tự thêm và thử lại; tham số này phải API NetEase đủ mới mới nhận, bản cũ cần cập nhật'],
  ['在音源的回答里没找到「', 'Trong câu trả lời của nguồn nhạc không tìm thấy 「'],
  ['」，也没认出别的播放链接', '」, cũng không nhận ra liên kết phát nào khác'],
  ['；回答的开头是：', '; phần đầu câu trả lời là: '],
  ['图片已收起', 'Ảnh đã thu lại'],
  [' 个版本 · 点一下展开', ' phiên bản · bấm để mở'],
  [' · 点一下展开', ' · bấm để mở'],
  ['展开图片，双击放大查看', 'Mở ảnh, bấm đúp để phóng to xem'],
  ['点一下收起，双击放大查看', 'Bấm một cái để thu lại, bấm đúp để phóng to xem'],
  ['、参数和操作', ', tham số và thao tác'],
);
TPL4.push(
  ['Gradio 的结果读不出来（HTTP 5）', 'Không đọc được kết quả của Gradio (HTTP {})'],
  ['（5 个版本）', ' ({} phiên bản)'],
);
