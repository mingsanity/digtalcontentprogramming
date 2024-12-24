// script.js

// Hàm tìm kiếm và tải hình ảnh
async function searchImages() {
    const query = document.getElementById('query').value.trim();
    const loader = document.getElementById('loader');

    if (!query) {
        alert('Vui lòng nhập từ khóa tìm kiếm.');
        return;
    }

    // Hiển thị loader khi bắt đầu quá trình tải
    loader.style.display = 'block';

    const apiKey = 'AIzaSyBCaNPH0weCZWjtmzBKK139z7pvb_0qIuE'; // Thay bằng API Key của bạn
    const cx = '85535eaf9fbc34732'; // Thay bằng Custom Search Engine ID của bạn
    const numImagesToDownload = 12;
    const numImagesPerRequest = 10; // Số hình ảnh mỗi lần yêu cầu
    let startIndex = 1; // Vị trí bắt đầu trong kết quả tìm kiếm
    let successfulDownloads = 0;
    let imageCount = 1;
    let totalResults = 0;

    while (successfulDownloads < numImagesToDownload) {
        const url = `https://www.googleapis.com/customsearch/v1?q=${encodeURIComponent(query)}&cx=${cx}&key=${apiKey}&searchType=image&num=${numImagesPerRequest}&start=${startIndex}`;

        try {
            const response = await fetch(url);
            const data = await response.json();

            if (data.error) {
                console.error('API Error:', data.error);
                alert('Đã xảy ra lỗi với API. Vui lòng kiểm tra lại API Key và CSE ID.');
                break;
            }

            if (data.items && data.items.length > 0) {
                totalResults = parseInt(data.searchInformation.totalResults, 10);
                console.log(`Total Results: ${totalResults}`);
                console.log(`Số lượng hình ảnh trả về: ${data.items.length}`);

                for (const item of data.items) {
                    if (successfulDownloads >= numImagesToDownload) break;
                    try {
                        await downloadImage(item.link, imageCount);
                        console.log(`Đã tải xuống image_${imageCount}.jpg`);
                        successfulDownloads++;
                        imageCount++;
                    } catch (err) {
                        console.error(`Error downloading image_${imageCount}.jpg:`, err);
                        // Không tăng imageCount để tên tệp liên tục
                    }
                }

                // Cập nhật startIndex cho lần yêu cầu tiếp theo
                startIndex += numImagesPerRequest;

                // Kiểm tra nếu đã duyệt qua tất cả kết quả
                if (startIndex > totalResults) {
                    console.warn('Đã duyệt qua tất cả các kết quả tìm kiếm.');
                    break;
                }
            } else {
                // Không còn hình ảnh nào để tải
                console.warn('Không còn hình ảnh nào để tải.');
                break;
            }
        } catch (error) {console.error('Error:', error);
            alert('Đã xảy ra lỗi khi tìm kiếm hình ảnh.');
            break;
        }
    }

    // Ẩn loader sau khi hoàn thành
    loader.style.display = 'none';

    if (successfulDownloads === numImagesToDownload) {
        alert(`Đã tải xuống ${successfulDownloads} hình ảnh thành công!`);
    } else {
        alert(`Đã tải xuống ${successfulDownloads} hình ảnh thành công. Không đủ hình ảnh để tải.`);
    }
    document.getElementById('openUnity').addEventListener('click', function () {
        // Chuyển hướng tới file Unity
        // window.location.href = 'build/index.html';
        window.location.href = 'display_images.html';

    });

}

// Hàm tải xuống hình ảnh
async function downloadImage(url, index) {
    const response = await fetch(url, { mode: 'cors' });
    if (!response.ok) throw new Error('Network response was not ok');

    const blob = await response.blob();
    const objectURL = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = objectURL;
    a.download = `image_${index}.jpg`; // Đặt tên tệp theo định dạng image_1.jpg, image_2.jpg, ...
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(objectURL);
}
