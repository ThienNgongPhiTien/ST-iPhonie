/* ST-iPhonie · Lớp phủ đa ngôn ngữ (Tiếng Việt <-> Tiếng Trung)
 * - Chỉ đổi chữ hiển thị (text node và thuộc tính title / placeholder / aria-label / alt / label).
 * - Không đụng tới giá trị, định danh, prompt gửi cho mô hình hay giao thức tin nhắn.
 * - Ở cửa sổ chính SillyTavern: chỉ dịch các phần tử thuộc ST-iPhonie, không quét DOM của SillyTavern.
 * - Hỗ trợ nút bấm chuyển đổi trực tiếp giữa Tiếng Việt (VI) và Tiếng Trung (中) không cần tải lại trang.
 */
import {EXACT, PATTERNS} from './dict.js';
import {EXACT2, SUBS, SUBR, PRE} from './extra.js';
import {EXACT3, SUBS3, SUBR3} from './extra2.js';

const STORAGE_KEY = 'sttts-vi';
const CJK = /[㐀-鿿]/;
const SKIP = 'script,style,textarea,code,pre,[contenteditable="true"],[contenteditable=""],.mes_text,[data-no-vi]';
const HOST_OWNED = '#sttts-extension-entry,#sttts-wand-entry,#sttts-floating,[class*="sttts-"],[data-sttts-owned],[data-sttts-pic],[data-sttts-line]';
const ATTRS = ['title', 'placeholder', 'aria-label', 'alt', 'label'];

// Bổ sung từ điển cho các tính năng mới từ bản 0.9.9 -> 0.9.41 (Tủ đồ, Trình tạo, v.v.)
const NEW_EXACT = {
  '衣柜': 'Tủ đồ',
  '生成器': 'Trình tạo',
  '未分类': 'Chưa phân loại',
  '有要穿上的': 'Có đồ sắp mặc',
  '找人': 'Tìm người',
  '谁的衣柜': 'Tủ đồ của ai',
  '下一次正文会写进去': 'Sẽ đưa vào phản hồi chính văn tiếp theo',
  '正文里换的': 'Đổi trong chính văn',
  '已经写进正文': 'Đã đưa vào chính văn',
  '脱下': 'Cởi ra',
  '正在识别…': 'Đang nhận diện…',
  '衣柜还是空的': 'Tủ đồ vẫn còn trống',
  '点右上角的 ＋ 放进第一件衣服': 'Bấm dấu ＋ ở góc trên bên phải để thêm món đồ đầu tiên',
  '按分类看': 'Xem theo phân loại',
  '选中的衣服': 'Trang phục đã chọn',
  '穿上': 'Mặc vào',
  '去搭配': 'Đi phối đồ',
  '拿出衣柜': 'Lấy khỏi tủ đồ',
  '衣柜里还没有写了描述的衣服': 'Trong tủ chưa có trang phục nào có mô tả',
  '看试穿图': 'Xem ảnh mặc thử',
  '怎么搭': 'Cách phối',
  '从衣柜选': 'Chọn từ tủ đồ',
  '自由设计': 'Tự do thiết kế',
  '想要什么样的': 'Muốn kiểu như thế nào',
  '想要的风格（选填）': 'Phong cách mong muốn (tùy chọn)',
  '例如：入秋的日常装，温柔、轻便': 'VD: Đồ thường ngày đầu thu, dịu dàng, nhẹ nhàng',
  '搭配中…': 'Đang phối đồ…',
  '搭一套': 'Phối một bộ',
  '搭好的在这里，也可以自己写': 'Bộ đã phối ở đây, bạn cũng có thể tự viết',
  '穿上这套': 'Mặc bộ này',
  '存进衣柜…': 'Đang lưu vào tủ đồ…',
  '存成一套': 'Lưu thành một bộ',
  '在画…': 'Đang vẽ…',
  '试穿图': 'Ảnh mặc thử',
  '存过的搭配': 'Các bộ đã lưu',
  '衣柜或搭配': 'Tủ đồ hoặc phối đồ',
  '搭配': 'Phối đồ',
  '拍照或选图片': 'Chụp ảnh hoặc chọn ảnh',
  '相册里没有能放进来的照片': 'Trong album không có ảnh nào đưa vào được',
  '从相册选': 'Chọn từ album',
  '认好了': 'Đã nhận diện xong',
  '写一件衣服': 'Viết mô tả trang phục',
  '比如：白色亚麻衬衫': 'VD: Áo sơ mi vải lanh trắng',
  '颜色、款式、材质、图案……': 'Màu sắc, kiểu dáng, chất liệu, họa tiết…',
  '重新识别': 'Nhận diện lại',
  '照片还留在相册里。': 'Ảnh vẫn được giữ trong album.',
  '还在认这件衣服，等一下': 'Vẫn đang nhận diện trang phục này, vui lòng đợi',
  '先给选中的衣服写上描述': 'Hãy viết mô tả cho trang phục đã chọn trước',
  '还没有设置绘图引擎': 'Chưa thiết lập engine vẽ ảnh',
  '试穿图画好了，相册的「衣柜试穿」里也有': 'Đã vẽ xong ảnh mặc thử, cũng có trong mục "Mặc thử tủ đồ" của Album',
  '这套存过了，在下面「存过的搭配」里': 'Bộ này đã lưu rồi, ở mục "Các bộ đã lưu" bên dưới',
  '存好了，在下面「存过的搭配」里': 'Đã lưu, ở mục "Các bộ đã lưu" bên dưới',
  '发给…': 'Gửi cho…',
  '这身': 'Bộ này',
  '脱下了': 'Đã cởi ra',
  '开场白': 'Lời mở đầu',
  '走向': 'Hướng đi cốt truyện',
  '群聊没有单独的角色卡：打开一张角色卡再写': 'Nhóm chat không có thẻ nhân vật riêng: hãy mở một thẻ nhân vật rồi viết',
  '先在酒馆里打开一张角色卡': 'Hãy mở một thẻ nhân vật trong quán rượu trước',
  '指定情境': 'Chỉ định tình huống',
  '开场方式': 'Cách mở đầu',
  '情境': 'Tình huống',
  '出场人物（选填）': 'Nhân vật xuất hiện (tùy chọn)',
  '再写一版': 'Viết thêm bản nữa',
  '上一版': 'Bản trước',
  '下一版': 'Bản sau',
  '在改…': 'Đang sửa…',
  '改一改': 'Sửa lại',
  '写入聊天': 'Ghi vào cuộc trò chuyện',
  '会加成开场白的新一版，左右滑能换回原来的': 'Sẽ thêm thành một bản mở đầu mới, vuốt trái/phải để đổi về bản cũ',
  '会成为这段聊天的第一条消息': 'Sẽ trở thành tin nhắn đầu tiên của cuộc trò chuyện này',
  '想要什么样的（选填）': 'Muốn kiểu như thế nào (tùy chọn)',
  '换上这个人设': 'Đổi sang thiết lập nhân vật (Persona) này',
  '存成酒馆人设': 'Lưu thành Persona của quán rượu',
  '想要（选填）': 'Mong muốn (tùy chọn)',
  '换一批': 'Đổi loạt khác',
  '想想接下来': 'Nghĩ diễn biến tiếp theo',
  '自己写一个': 'Tự viết một cái',
  '念出来': 'Đọc thành tiếng',
  '念出来的剧本': 'Kịch bản đọc thành tiếng',
  '做成卡片': 'Tạo thành thẻ',
  '形式': 'Hình thức',
  '接着剧情': 'Tiếp nối cốt truyện',
  '只用设定': 'Chỉ dùng thiết lập',
  '从哪来': 'Lấy từ đâu',
  '想看什么（选填）': 'Muốn xem gì (tùy chọn)',
  '写一段': 'Viết một đoạn',
  '写过的小剧场': 'Tiểu kịch trường đã viết',
  '剧本': 'Kịch bản',
  '写什么': 'Viết gì',
  '加到聊天最后？': 'Thêm vào cuối cuộc trò chuyện?',
  // 0.9.42 -> 0.9.46: Chính văn & điện thoại, thú cưng trang trí, quản lý nhóm, diễn đàn, đọc chính văn, ghi nhớ
  '（回复达到长度上限，末句可能未写完）': ' (Phản hồi đạt giới hạn độ dài, câu cuối có thể chưa viết xong)',
  '（后续内容过长，已省略）': ' (Nội dung phía sau quá dài, đã lược bỏ)',
  '只能邀请联系人里的好友': 'Chỉ có thể mời bạn bè trong danh bạ',
  '10 分钟': '10 phút',
  '1 小时': '1 giờ',
  '12 小时': '12 giờ',
  '1 天': '1 ngày',
  '解除': 'Gỡ bỏ',
  '旁观群不能管理成员': 'Nhóm quan sát không thể quản lý thành viên',
  '群成员已达到上限': 'Thành viên nhóm đã đạt giới hạn',
  '群里至少保留一位联系人': 'Trong nhóm phải giữ lại ít nhất một người liên hệ',
  '请选择禁言时长': 'Vui lòng chọn thời lượng cấm chat',
  '群管理操作无效': 'Thao tác quản lý nhóm không hợp lệ',
  '作者注释': 'Ghi chú của tác giả',
  '向量存储（聊天）': 'Lưu trữ vector (Trò chuyện)',
  '向量存储（资料库）': 'Lưu trữ vector (Kho dữ liệu)',
  '智能上下文': 'Ngữ cảnh thông minh',
  '角色备注': 'Ghi chú nhân vật',
  '剧情剪辑台': 'Bàn dựng cốt truyện',
  '酒馆总结': 'Tóm tắt của quán rượu',
  '这次没有人接话，点这条回帖的 ⋯ → 重试': 'Lần này chưa có ai trả lời, hãy bấm ⋯ → Thử lại ở bình luận này',
  '正文读取': 'Đọc chính văn',
  '当前酒馆读不到已保存的正文提示词': 'Quán rượu hiện tại không đọc được prompt chính văn đã lưu',
  '当前聊天没有为可见的角色回复保存提示词': 'Cuộc trò chuyện hiện tại chưa lưu prompt cho phản hồi nhân vật đang hiển thị',
  '这份正文使用文本补全，暂时只支持聊天补全的已存提示词': 'Chính văn này dùng Text Completion, hiện chỉ hỗ trợ prompt đã lưu của Chat Completion',
  '已保存的正文提示词': 'Prompt chính văn đã lưu',
  '请先发送一次正文': 'Vui lòng gửi chính văn một lần trước',
  '正在读取已保存的正文提示词……': 'Đang đọc prompt chính văn đã lưu……',
  '不读取正文上下文': 'Không đọc ngữ cảnh chính văn',
  '请先在酒馆打开有正文的聊天，或关闭「读取正文上下文」': 'Vui lòng mở cuộc trò chuyện có chính văn trong quán rượu trước, hoặc tắt「Đọc ngữ cảnh chính văn」',
  '读取酒馆已保存的正文提示词，刷新后仍可使用，并接上最新回复。识别出的正文预设条目默认去掉，按助手的酒馆预设条目开关保留；读不到时使用本次打开期间的发送快照。两种都没有时才需要先发送一次正文。': 'Đọc prompt chính văn đã lưu của quán rượu, sau khi tải lại trang vẫn dùng được và nối tiếp phản hồi mới nhất. Các mục preset chính văn nhận diện được sẽ mặc định bỏ qua, hoặc giữ lại theo công tắc mục preset quán rượu của Trợ lý; khi không đọc được sẽ dùng bản chụp gửi trong lần mở này. Chỉ khi không có cả hai mới cần gửi chính văn một lần trước.',
  '新建、另存为、删除助手预设': 'Tạo mới, lưu thành bản khác, xóa preset trợ lý',
  '添加条目': 'Thêm mục',
  '删除条目': 'Xóa mục',
  '正文快照完整保留当次发送内容，不由此处的条目开关裁剪。': 'Bản chụp chính văn giữ nguyên toàn bộ nội dung gửi lần đó, không bị cắt bớt bởi công tắc mục tại đây.',
  '这个条目没有文字内容。': 'Mục này không có nội dung văn bản.',
  '记忆关着（预设 → 聊天 → 手机聊天）。': 'Trí nhớ đang tắt (Preset → Trò chuyện → Trò chuyện điện thoại).',
  '记忆关着（助手设置 → 记忆）。': 'Trí nhớ đang tắt (Cài đặt trợ lý → Trí nhớ).',
  '小猫': 'Mèo con',
  '小鸡': 'Gà con',
  '史莱姆': 'Slime',
  '小螃蟹': 'Cua nhỏ',
  '慢一点呀': 'Chậm một chút nha',
  '还没有宠物，领养一只吧': 'Chưa có thú cưng, hãy nhận nuôi một bé nhé',
  '领养一只，让它陪你聊天：走走停停、玩小球，还会跑去看新消息。': 'Nhận nuôi một bé để bầu bạn khi trò chuyện: đi dạo, chơi bóng nhỏ và chạy lại xem tin nhắn mới.',
  '领养': 'Nhận nuôi',
  '领养哪一种': 'Nhận nuôi loại nào',
  '点一下、双击或在身上来回摸摸，会有不同反应；也可以拖起来放到气泡上。它们会自己玩、贴贴、一起打盹。关掉后暂时藏起来。': 'Chạm một lần, chạm đúp hoặc vuốt ve qua lại trên người sẽ có phản ứng khác nhau; cũng có thể kéo lên đặt vào bong bóng chat. Chúng sẽ tự chơi, dụi vào nhau, cùng ngủ gật. Tắt đi sẽ tạm ẩn chúng.',
  '点点、摸摸，或者拖起来玩。长按可以打开这张卡片。': 'Chạm nhẹ, vuốt ve hoặc kéo lên để chơi. Nhấn giữ để mở thẻ này.',
  '送养': 'Cho nhận nuôi',
  '带回家': 'Đưa về nhà',
  '改名字': 'Đổi tên',
  '邀请好友': 'Mời bạn bè',
  '从联系人中选择': 'Chọn từ danh bạ',
  '移出成员': 'Đưa thành viên ra',
  '选择后确认一次': 'Xác nhận một lần sau khi chọn',
  '禁言': 'Cấm chat',
  '选择成员和时长，或解除禁言': 'Chọn thành viên và thời lượng, hoặc gỡ cấm chat',
  '时长': 'Thời lượng',
  '没有可选的好友': 'Không có bạn bè nào để chọn',
  '请先选择好友': 'Vui lòng chọn bạn bè trước',
  '移出这些成员？': 'Đưa những thành viên này ra khỏi nhóm?',
  '群设置': 'Cài đặt nhóm',
  '改群名': 'Đổi tên nhóm',
  '从相册选一张或上传，也可以换回成员拼的头像': 'Chọn một tấm từ album hoặc tải lên, cũng có thể đổi về ảnh ghép từ các thành viên',
  '我在本群的昵称': 'Biệt danh của tôi trong nhóm này',
  '用你自己的名字': 'Dùng tên của chính bạn',
  '网名头像': 'Ảnh đại diện biệt danh mạng',
  '回复菜单': 'Menu phản hồi',
  '我的回复': 'Phản hồi của tôi',
  '重试': 'Thử lại',
  '让大家再回一次': 'Để mọi người trả lời lại lần nữa',
  '转发给…': 'Chuyển tiếp cho…',
  '发给联系人或群，TA 读得到帖子': 'Gửi cho người liên hệ hoặc nhóm, đối phương đọc được bài viết',
  '帖子和下面的回复': 'Bài viết và các phản hồi bên dưới',
  '正文选了「照正文原样」：正文触发的世界书已经在那一份里，这里只另读「只给手机」的书，不会重复。': 'Chính văn đang chọn「Giống hệt chính văn」: Sách thế giới do chính văn kích hoạt đã nằm sẵn trong bản đó, ở đây chỉ đọc thêm sách「Chỉ dành cho điện thoại」, không bị trùng lặp.',
  '聊得久了，「读取聊天记录」之外的消息模型就看不到了。打开后，更早的消息会自动整理成摘要，摘要多了再合成阶段总结、长期总览（每整理一次调用一次文字模型）；回消息、打电话、查手机和朋友圈都会带上。每段聊天的记忆在聊天右上角「⋯ → 记忆」里看和改。': 'Khi trò chuyện lâu, các tin nhắn nằm ngoài phạm vi「Đọc lịch sử trò chuyện」mô hình sẽ không thấy nữa. Sau khi bật, các tin nhắn cũ hơn sẽ tự động được sắp xếp thành tóm tắt, nhiều bản tóm tắt sẽ gộp tiếp thành tổng kết giai đoạn, tổng quan dài hạn (mỗi lần sắp xếp gọi mô hình văn bản một lần); khi trả lời tin nhắn, gọi điện, xem điện thoại và Vòng bạn bè đều sẽ mang theo. Xem và sửa ký ức của từng cuộc trò chuyện tại góc trên bên phải「⋯ → Trí nhớ」.',
  '手机按所选模式读取正文。装了记忆插件（剧情剪辑台、酒馆自带的总结，或者别的把整理好的剧情注入给模型的插件）的话，勾上它注入的那一项，聊天、电话、查手机、朋友圈和论坛就会多带一段「更早的剧情」，记得很久以前的事。\n\n点「读取」列出酒馆现在注入的内容，看开头就知道是哪个插件的。剧情剪辑台和酒馆总结默认就勾着。把记忆写进世界书的插件不用勾，小手机本来就读世界书。': 'Điện thoại đọc chính văn theo chế độ đã chọn. Nếu có cài plugin trí nhớ (Bàn dựng cốt truyện, Tóm tắt có sẵn của quán rượu, hoặc plugin khác tiêm cốt truyện đã tóm tắt cho mô hình), hãy tích chọn mục mà nó tiêm vào; khi trò chuyện, gọi điện, xem điện thoại, Vòng bạn bè và diễn đàn sẽ kèm thêm phần「Cốt truyện sớm hơn」để nhớ lại chuyện từ rất lâu trước đó.\n\nBấm「Đọc」để liệt kê các nội dung quán rượu đang tiêm vào, nhìn phần đầu là biết của plugin nào. Bàn dựng cốt truyện và Tóm tắt của quán rượu mặc định được tích sẵn. Plugin nào ghi trí nhớ vào Sách thế giới thì không cần tích, vì điện thoại vốn đã đọc Sách thế giới.',
  '跟着酒馆': 'Theo quán rượu',
  '隐藏的楼不读，其余从新往旧读到字数上限': 'Bỏ qua các tầng bị ẩn, phần còn lại đọc từ mới đến cũ cho tới giới hạn số chữ',
  '照正文原样': 'Giống hệt chính văn',
  '和正文模型看到的一样，最费 token': 'Giống hệt những gì mô hình chính văn nhìn thấy, tốn nhiều token nhất',
  '只读最近几条': 'Chỉ đọc vài tin gần nhất',
  '自己定条数': 'Tự chọn số lượng tin',
  '不读': 'Không đọc',
  '手机不知道剧情': 'Điện thoại không biết cốt truyện',
  '比如 status, 状态栏': 'VD: status, 状态栏',
  '写标签名，逗号隔开。正文和手机回复里用这些标签包住的内容会去掉，世界书条目里的也一样。照正文原样时只清洗接上的新楼，已存历史保持原样。': 'Nhập tên thẻ, cách nhau bằng dấu phẩy. Nội dung nằm trong các thẻ này ở chính văn và phản hồi điện thoại sẽ bị loại bỏ, trong mục Sách thế giới cũng vậy. Khi chọn「Giống hệt chính văn」thì chỉ làm sạch các tầng mới nối thêm, lịch sử đã lưu giữ nguyên.',
  '怎么读正文': 'Cách đọc chính văn',
  '手机不读取正文剧情。': 'Điện thoại không đọc cốt truyện chính văn.',
  '每次聊天都会把正文那一整份发过去，可能几万到十几万 token；没有存的时候自动改用「跟着酒馆」。': 'Mỗi lần trò chuyện đều gửi toàn bộ bản prompt của chính văn đi, có thể tốn từ vài chục nghìn đến hơn trăm nghìn token; khi chưa có bản lưu sẽ tự động chuyển sang「Theo quán rượu」.',
  '使用最新可见角色回复生成时保存的聊天补全提示词，保留历史的原始顺序，再接上新楼。正文预设中能认出的写作要求默认去掉；未认出的内容保留。文本补全不支持。': 'Sử dụng prompt Chat Completion đã lưu khi tạo phản hồi nhân vật hiển thị mới nhất, giữ nguyên thứ tự lịch sử gốc rồi nối thêm các tầng mới. Các yêu cầu viết văn nhận diện được trong preset chính văn mặc định sẽ được bỏ ra; nội dung không nhận diện được sẽ giữ nguyên. Không hỗ trợ Text Completion.',
  '正文预设': 'Preset chính văn',
  '正文预设的条目': 'Các mục của preset chính văn',
  '只列认得出的条目 · 默认全关': 'Chỉ liệt kê các mục nhận diện được · Mặc định tắt hết',
  '新楼层': 'Các tầng mới',
  '读取范围': 'Phạm vi đọc',
  '最近几条': 'Số tin gần nhất',
  '每条最多（字）': 'Tối đa mỗi tin (chữ)',
  '超长正文取前面这些字；0 不限制。': 'Chính văn quá dài chỉ lấy chừng này chữ ở đầu; 0 là không giới hạn.',
  '一共最多（字）': 'Tổng cộng tối đa (chữ)',
  '从新往旧读到上限；0 不限制。': 'Đọc từ mới về cũ cho đến giới hạn; 0 là không giới hạn.',
  '内容处理': 'Xử lý nội dung',
  '更早的剧情': 'Cốt truyện sớm hơn',
  '酒馆正则（仅提示词）会自动照样套用。': 'Regex của quán rượu (chỉ áp dụng cho prompt) sẽ tự động được áp dụng như cũ.',
  '正在读取已保存的提示词……': 'Đang đọc prompt đã lưu……',
  '可以用：角色回复生成时存了提示词': 'Có thể dùng: Đã lưu prompt khi tạo phản hồi nhân vật',
  '当前酒馆没有提供已存提示词接口': 'Quán rượu hiện tại không cung cấp giao diện đọc prompt đã lưu',
  '已存提示词读取失败': 'Đọc prompt đã lưu thất bại',
  '这份提示词里没有认得出的预设条目。': 'Trong bản prompt này không có mục preset nào nhận diện được.',
  '手机这边知道多少剧情。': 'Phía điện thoại biết được bao nhiêu cốt truyện.',
  '手机聊天': 'Trò chuyện điện thoại',
  '回消息时带上最近多少条手机聊天，原样给模型看。': 'Khi trả lời tin nhắn sẽ mang theo bao nhiêu tin trò chuyện điện thoại gần nhất, gửi nguyên văn cho mô hình xem.',
  '手机里聊过的话，模型能看到多少、更早的怎么记住。': 'Những lời đã trò chuyện trong điện thoại, mô hình thấy được bao nhiêu và ghi nhớ các tin cũ hơn như thế nào.',
  '带进正文': 'Đưa vào chính văn',
  '挑哪些消息、哪些聊天一直带着，在「设置 → 正文和手机」里，或者聊天顶上的「带进剧情」。': 'Chọn những tin nhắn nào hoặc cuộc trò chuyện nào luôn mang theo trong「Cài đặt → Chính văn và điện thoại」, hoặc nút「Đưa vào cốt truyện」ở đầu cuộc trò chuyện.',
  '反过来：手机里的聊天怎么写进正文、插在正文请求的哪里。深度与身份仅在聊天内插入时生效。': 'Chiều ngược lại: đưa cuộc trò chuyện trong điện thoại vào chính văn như thế nào và chèn ở đâu trong yêu cầu chính văn. Độ sâu và vai trò chỉ có hiệu lực khi chèn trong chat.',
  '收藏夹已满，未能保存这个音色': 'Kho yêu thích đã đầy, không thể lưu giọng này',
  '正文和手机': 'Chính văn và điện thoại',
  '手机 → 正文': 'Điện thoại → Chính văn',
  '正文 → 手机': 'Chính văn → Điện thoại',
  '这段聊天': 'Cuộc trò chuyện này',
  '这一次 · 选几条': 'Lần này · Chọn vài tin',
  '选几条': 'Chọn vài tin',
  '一直带着': 'Luôn mang theo',
  '一直带着的聊天': 'Cuộc trò chuyện luôn mang theo',
  '每次写正文都带上这段聊天的记忆和还没整理的消息，会多占一些正文的字数。': 'Mỗi lần viết chính văn đều mang theo ký ức và các tin nhắn chưa sắp xếp của cuộc trò chuyện này, sẽ chiếm thêm một phần độ dài chính văn.',
  '挑几条消息，原样带进下一次正文，用一次就没了。再选一次会替换掉之前选的。': 'Chọn vài tin nhắn để đưa nguyên văn vào chính văn lần tiếp theo, chỉ dùng một lần. Chọn lại sẽ thay thế phần đã chọn trước đó.',
  '没有等着带进下一次正文的消息。': 'Không có tin nhắn nào đang chờ đưa vào chính văn lần tiếp theo.',
  '在聊天里点顶上的「带进剧情」可以挑消息或让正文一直记得这段聊天。': 'Trong cuộc trò chuyện, bấm「Đưa vào cốt truyện」ở trên cùng để chọn tin nhắn hoặc để chính văn luôn nhớ cuộc trò chuyện này.',
  '已取消，这次不带聊天进正文': 'Đã hủy, lần này không đưa cuộc trò chuyện vào chính văn',
  '想让正文一直记得某段聊天：在那段聊天里点「带进剧情」，在「正文和手机 → 这段聊天」打开「一直带着」。': 'Muốn chính văn luôn nhớ một cuộc trò chuyện: trong cuộc trò chuyện đó bấm「Đưa vào cốt truyện」, rồi bật「Luôn mang theo」ở mục「Chính văn và điện thoại → Cuộc trò chuyện này」.',
  '显示译文': 'Hiển thị bản dịch',
  '显示原文': 'Hiển thị nguyên văn',
  '原文和译文': 'Nguyên văn và bản dịch'
};

const NEW_SUBS = [
  ['（回复达到长度上限，末句可能未写完）', ' (Phản hồi đạt giới hạn độ dài, câu cuối có thể chưa viết xong)'],
  ['（后续内容过长，已省略）', ' (Nội dung phía sau quá dài, đã lược bỏ)'],
  ['，已改用跟着酒馆', ', đã chuyển sang dùng Theo quán rượu'],
  [' · 自动转文字', ' · Tự động chuyển thành chữ'],
  [' · 点开看全文', ' · Bấm để xem toàn văn'],
  [' · 接口：默认', ' · Giao diện: Mặc định'],
  [' · 接口：', ' · Giao diện: '],
  ['接口：默认', 'Giao diện: Mặc định'],
  ['接口：', 'Giao diện: '],
  ['。选得比较多，模型可能抓不住重点，挑关键的几段效果更好；想让正文一直记得手机里聊过的事，可以打开「正文和手机 → 这段聊天 → 一直带着」', '. Bạn chọn khá nhiều tin, mô hình có thể khó nắm trọng tâm, chọn vài đoạn quan trọng sẽ hiệu quả hơn; muốn chính văn luôn nhớ chuyện đã trò chuyện trên điện thoại, hãy bật「Chính văn và điện thoại → Cuộc trò chuyện này → Luôn mang theo」'],
];

const NEW_PRE = [
  [/^你邀请 (.+) 加入了群聊$/, 'Bạn đã mời $1 vào nhóm chat'],
  [/^(.+) 被移出了群聊$/, '$1 đã bị đưa ra khỏi nhóm chat'],
  [/^(.+) 被禁言 (10 分钟|1 小时|12 小时|1 天)$/, (m, who, d) => `${who} đã bị cấm chat ${({ '10 分钟': '10 phút', '1 小时': '1 giờ', '12 小时': '12 giờ', '1 天': '1 ngày' })[d] || d}`],
  [/^(.+) 的禁言解除了$/, 'Đã gỡ cấm chat cho $1'],
  [/^(\d+) 字 · 点开看全文$/, '$1 chữ · Bấm để xem toàn văn'],
  [/^现在用不了：(.+)，会改用跟着酒馆$/, (m, r) => `Hiện không dùng được: ${NEW_EXACT[r.trim()] || EXACT[r.trim()] || r}, sẽ chuyển sang Theo quán rượu`],
  [/^(.+)，已改用跟着酒馆$/, (m, r) => `${NEW_EXACT[r.trim()] || EXACT[r.trim()] || r}, đã chuyển sang dùng Theo quán rượu`],
  [/^(跟着酒馆|照正文原样|只读最近几条|不读) · 记忆插件 (\d+) 项$/, (m, mode, n) => `${NEW_EXACT[mode] || mode} · Plugin trí nhớ ${n} mục`],
  [/^最近 (\d+) 条 · 记忆(开|关)$/, (m, n, st) => `${n} tin gần nhất · Trí nhớ: ${st === '开' ? 'Bật' : 'Tắt'}`],
  [/^手机→正文：(\d+) 段一直带着 · 正文→手机：(开|关)$/, (m, n, st) => `Điện thoại→Chính văn: ${n} cuộc luôn mang theo · Chính văn→Điện thoại: ${st === '开' ? 'Bật' : 'Tắt'}`],
  [/^自动回复(开|关) · 逐条显示(开|关) · 语音、来电、正文和手机$/, (m, a, b) => `Tự động trả lời: ${a === '开' ? 'Bật' : 'Tắt'} · Hiển thị từng tin: ${b === '开' ? 'Bật' : 'Tắt'} · Tin thoại, cuộc gọi, chính văn & điện thoại`],
  [/^和(.+)的聊天有 (\d+) 条等着带进下一次正文$/, 'Cuộc trò chuyện với $1 có $2 tin đang chờ đưa vào chính văn lần tiếp theo'],
];

const NEW_SUBR = [
  [/\[日志只留前 (\d+) 字；实际发出去的是完整的\]/g, '[Nhật ký chỉ lưu $1 chữ đầu; nội dung thực tế gửi đi vẫn đầy đủ]'],
  [/聊天内第 (\d+) 层/g, 'Tầng $1 trong chat'],
  [/ · 主提示词后 · /g, ' · Sau prompt chính · '],
  [/ · 主提示词前 · /g, ' · Trước prompt chính · '],
  [/ · 位置 未提供 · /g, ' · Vị trí chưa cung cấp · '],
  [/ · (系统|用户|助手)$/g, (m, r) => ` · ${({ 系统: 'Hệ thống', 用户: 'Người dùng', 助手: 'Trợ lý' })[r] || r}`],
];

PRE.unshift(...NEW_PRE);
SUBR.push(...NEW_SUBR);

const exact = new Map(Object.entries(EXACT));
for (const [k, v] of Object.entries(EXACT2)) exact.set(k, v);
for (const [k, v] of Object.entries(EXACT3)) exact.set(k, v);
for (const [k, v] of Object.entries(NEW_EXACT)) exact.set(k, v);

const subs = [...SUBS, ...SUBS3, ...NEW_SUBS].sort((a, b) => b[0].length - a[0].length);
const norm = s => s.replace(/\s+/g, ' ');
const exactN = new Map();
for (const [k, v] of exact) { const n = norm(k); if (n !== k && !exactN.has(n)) exactN.set(n, v); }
const esc = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const pats = PATTERNS.map(([zh, vi]) => {
  const parts = zh.split('⟦⟧');
  const lit = parts.reduce((a, b) => (b.length > a.length ? b : a), '');
  const cjkN = (zh.match(/[㐀-鿿]/g) || []).length;
  const grp = cjkN < 3 ? '([^\\n]{0,40}?)' : '([\\s\\S]*?)';
  return {re: new RegExp('^' + parts.map(esc).join(grp) + '$'), lit, vi: vi.split('⟦⟧')};
});
const cache = new Map();
const WD = {日: 'Chủ Nhật', 一: 'Thứ Hai', 二: 'Thứ Ba', 三: 'Thứ Tư', 四: 'Thứ Năm', 五: 'Thứ Sáu', 六: 'Thứ Bảy'};

export function isViEnabled(win = window) {
  try { return win.localStorage.getItem(STORAGE_KEY) !== 'off'; } catch { return true; }
}

function fill(p, m) {
  let out = p.vi[0];
  for (let i = 1; i < p.vi.length; i++) {
    let g = m[i] ?? '';
    if (CJK.test(g)) { const t = lookup(g.trim()); if (t != null) g = g.replace(g.trim(), t); }
    if (WD[g] && out.endsWith('Thứ ')) { out = out.slice(0, -4) + WD[g]; g = ''; }
    out += g + p.vi[i];
  }
  return out;
}

function lookup(t) {
  if (!t || !CJK.test(t)) return null;
  for (const [re, vi] of PRE) { if (re.test(t)) return t.replace(re, vi); }
  const hit = exact.get(t);
  if (hit != null) return hit;
  const n = norm(t);
  const h2 = exactN.get(n) ?? exact.get(n);
  if (h2 != null) return h2;
  if (n.length > 600) return null;
  for (const p of pats) {
    if (!n.includes(p.lit)) continue;
    const m = p.re.exec(n);
    if (m) return fill(p, m);
  }
  return null;
}

const cjkCount = s => (s.match(/[㐀-鿿]/g) || []).length;

function subst(text) {
  if (text.length > 600) return text;
  let o = text;
  for (const [re, vi] of SUBR3) {
    re.lastIndex = 0;
    o = o.replace(re, (...a) => {
      const g = a.slice(1, -2);
      return vi.replace(/\$(\d)/g, (m, d) => {
        const x = g[d - 1];
        return x == null ? '' : (exact.get(x.trim()) ?? x);
      });
    });
  }
  for (const [zh, vi] of subs) if (o.includes(zh)) o = o.split(zh).join(vi);
  for (const [re, vi] of SUBR) { re.lastIndex = 0; o = o.replace(re, vi); }
  if (o === text) return text;
  return o.replace(/。(?=\S)/g, '. ').replace(/。/g, '.');
}

export function translate(text) {
  if (typeof text !== 'string' || text.length > 1500 || !CJK.test(text)) return text;
  if (cache.has(text)) return cache.get(text);
  const t = text.trim();
  const r = lookup(t);
  let out = text;
  if (r != null) {
    const i = text.indexOf(t);
    out = text.slice(0, i) + r + text.slice(i + t.length);
  }
  if (r == null || cjkCount(out) > 0) {
    const b = subst(text);
    if (b !== text && (r == null || cjkCount(b) < cjkCount(out))) out = b;
  }
  if (cache.size > 4000) cache.clear();
  cache.set(text, out);
  return out;
}

const skipped = (n, isMainHost) => {
  const el = n.nodeType === 1 ? n : n.parentElement;
  if (!el || el.closest?.(SKIP)) return true;
  if (isMainHost && !el.closest?.(HOST_OWNED)) return true;
  return false;
};

const trackedText = new Set();
const trackedEls = new Set();

function doText(n, viOn, isMainHost) {
  if (skipped(n, isMainHost)) return;
  const v = n.nodeValue;
  if (!viOn) {
    if (n.__viOrig != null && v === n.__viOut) n.nodeValue = n.__viOrig;
    return;
  }
  if (!v || v === n.__viOut) return;
  const src = (n.__viOrig != null && v === n.__viOut) ? n.__viOrig : v;
  if (!CJK.test(src)) return;
  const o = translate(src);
  n.__viOrig = src;
  n.__viOut = o;
  trackedText.add(n);
  if (o !== v) n.nodeValue = o;
}

function doEl(el, viOn, isMainHost) {
  if (skipped(el, isMainHost)) return;
  for (const a of ATTRS) {
    const v = el.getAttribute?.(a);
    if (!viOn) {
      const orig = el.__viAttrOrig?.[a];
      if (orig != null && v === el.__viAttrOut?.[a]) el.setAttribute(a, orig);
      continue;
    }
    if (!v || v === el.__viAttrOut?.[a]) continue;
    if (!CJK.test(v)) continue;
    const o = translate(v);
    (el.__viAttrOrig ??= {})[a] = v;
    (el.__viAttrOut ??= {})[a] = o;
    trackedEls.add(el);
    if (o !== v) el.setAttribute(a, o);
  }
  if (el.tagName === 'INPUT' && /^(button|submit|reset)$/i.test(el.type)) {
    const v = el.value;
    if (!viOn) {
      if (el.__viValOrig != null && v === el.__viValOut) el.value = el.__viValOrig;
      return;
    }
    if (v && v !== el.__viValOut && CJK.test(v)) {
      const o = translate(v);
      el.__viValOrig = v;
      el.__viValOut = o;
      trackedEls.add(el);
      if (o !== v) el.value = o;
    }
  }
}

function walk(root, viOn, isMainHost) {
  if (!root) return;
  if (root.nodeType === 3) return doText(root, viOn, isMainHost);
  if (root.nodeType !== 1 && root.nodeType !== 9 && root.nodeType !== 11) return;
  if (root.nodeType === 1) {
    if (root.matches?.(SKIP)) return;
    if (isMainHost && !root.closest?.(HOST_OWNED)) {
      root.querySelectorAll?.(HOST_OWNED).forEach(sub => walk(sub, viOn, false));
      return;
    }
    doEl(root, viOn, false);
  }
  const doc = root.ownerDocument || root;
  const tw = doc.createTreeWalker(root, 4 | 1, {
    acceptNode: n => (n.nodeType === 1 && n.matches?.(SKIP) ? 2 : 1)
  });
  let n;
  while ((n = tw.nextNode())) {
    if (n.nodeType === 3) doText(n, viOn, false);
    else doEl(n, viOn, false);
  }
}

function restoreAll() {
  for (const n of trackedText) {
    if (!n.isConnected) { trackedText.delete(n); continue; }
    if (n.__viOrig != null && n.nodeValue === n.__viOut) n.nodeValue = n.__viOrig;
  }
  for (const el of trackedEls) {
    if (!el.isConnected) { trackedEls.delete(el); continue; }
    if (el.__viAttrOrig) {
      for (const a of ATTRS) {
        if (el.__viAttrOrig[a] != null && el.getAttribute(a) === el.__viAttrOut?.[a]) {
          el.setAttribute(a, el.__viAttrOrig[a]);
        }
      }
    }
    if (el.__viValOrig != null && el.value === el.__viValOut) el.value = el.__viValOrig;
  }
}

function mountSwitchButtons(doc, viOn, toggle) {
  const label = viOn ? '🌐 VI' : '🌐 中';
  const tip = viOn ? 'Đang dùng Tiếng Việt (Bấm để đổi sang Tiếng Trung / 切换中文)' : '当前为中文界面（点击切换越南语 / Đổi sang Tiếng Việt）';

  // 1. Nút trên thanh tiêu đề của điện thoại (trong iframe ui/index.html)
  const stageActions = doc.querySelector('.stage-actions');
  if (stageActions && !stageActions.querySelector('[data-vi-toggle]')) {
    const btn = doc.createElement('button');
    btn.type = 'button';
    btn.dataset.viToggle = '1';
    btn.dataset.noVi = '1';
    btn.className = 'size-button';
    btn.style.cssText = 'padding:0 6px;font-size:11px;font-weight:600;cursor:pointer;min-width:38px;';
    stageActions.prepend(btn);
    btn.addEventListener('click', e => { e.stopPropagation(); toggle(); });
  }

  // 2. Nút trong bảng mở rộng ST-iPhonie của SillyTavern (cửa sổ chính)
  const drawer = doc.querySelector('#sttts-extension-entry .inline-drawer-content');
  if (drawer && !drawer.querySelector('[data-vi-toggle]')) {
    const btn = doc.createElement('button');
    btn.type = 'button';
    btn.dataset.viToggle = '1';
    btn.dataset.noVi = '1';
    btn.className = 'menu_button';
    btn.style.cssText = 'margin-left:6px;width:auto;padding:0 10px;';
    drawer.append(btn);
    btn.addEventListener('click', e => { e.stopPropagation(); toggle(); });
  }

  doc.querySelectorAll('[data-vi-toggle]').forEach(btn => {
    btn.textContent = label;
    btn.title = tip;
  });
}

export function install(win = window) {
  const doc = win.document;
  if (win.__sttsViInstalled) return;
  win.__sttsViInstalled = true;

  const isMainHost = win === win.top && !doc.getElementById('root');
  let viOn = isViEnabled(win);
  let flushing = false;
  const queue = new Set();
  let timer = 0;

  const flush = () => {
    timer = 0;
    if (flushing) return;
    flushing = true;
    try {
      const q = [...queue];
      queue.clear();
      if (viOn) {
        for (const n of q) { try { walk(n, true, isMainHost); } catch {} }
      }
      mountSwitchButtons(doc, viOn, toggleLanguage);
    } finally {
      flushing = false;
    }
  };

  const later = () => { if (!timer) timer = win.setTimeout(flush, 16); };

  function applyLanguage(nextVi) {
    viOn = nextVi;
    doc.documentElement.setAttribute('lang', viOn ? 'vi' : 'zh-CN');
    flushing = true;
    try {
      if (!viOn) restoreAll();
      else walk(doc.documentElement, true, isMainHost);
      mountSwitchButtons(doc, viOn, toggleLanguage);
    } finally {
      flushing = false;
    }
  }

  function toggleLanguage() {
    const nextVi = !viOn;
    try { win.localStorage.setItem(STORAGE_KEY, nextVi ? 'on' : 'off'); } catch {}
    applyLanguage(nextVi);
    try {
      if (win.parent && win.parent !== win) win.parent.__sttsViSync?.(nextVi);
      doc.querySelectorAll('iframe').forEach(f => f.contentWindow?.__sttsViSync?.(nextVi));
    } catch {}
  }

  win.__sttsViSync = nextVi => {
    if (nextVi !== viOn) applyLanguage(nextVi);
  };
  win.addEventListener('storage', e => {
    if (e.key === STORAGE_KEY) applyLanguage(e.newValue !== 'off');
  });

  const mo = new win.MutationObserver(list => {
    if (flushing) return;
    for (const m of list) {
      if (m.type === 'childList') {
        m.addedNodes.forEach(n => {
          if (n.nodeType !== 1 && n.nodeType !== 3) return;
          if (isMainHost) {
            const el = n.nodeType === 1 ? n : n.parentElement;
            if (!el || (!el.closest?.(HOST_OWNED) && !el.querySelector?.(HOST_OWNED))) return;
          }
          queue.add(n);
        });
      } else if (m.type === 'characterData' || m.type === 'attributes') {
        if (isMainHost && !m.target.parentElement?.closest?.(HOST_OWNED)) continue;
        queue.add(m.target);
      }
    }
    if (queue.size) later();
  });

  const start = () => {
    applyLanguage(isViEnabled(win));
    mo.observe(doc.documentElement, {
      childList: true, subtree: true, characterData: true,
      attributes: true, attributeFilter: ATTRS
    });
  };

  if (doc.readyState === 'loading') doc.addEventListener('DOMContentLoaded', start, {once: true});
  else start();

  for (const f of ['alert', 'confirm', 'prompt']) {
    const orig = win[f]?.bind(win);
    if (!orig) continue;
    win[f] = (msg, ...rest) => orig(viOn && typeof msg === 'string' ? translate(msg) : msg, ...rest);
  }
}

if (typeof window !== 'undefined' && typeof document !== 'undefined') install(window);
