const token = "your token";

let player;
let deviceId;
let isPlaying = false; // 현재 재생 상태
// 토큰 받아오기
// async function getAccessToken() {
//   const response = await axios.post(
//     "https://accounts.spotify.com/api/token",
//     new URLSearchParams({ grant_type: "client_credentials" }),
//     {
//       headers: {
//         Authorization: "Basic " + btoa(clientId + ":" + clientSecret),
//         "Content-Type": "application/x-www-form-urlencoded",
//       },
//       //   btoa() 함수는 Client ID와 Client Secret을 Base64로 인코딩하는 역할을 합니다.
//     }
//   );
//   console.log(response.data.access_token);
//   return response.data.access_token;
// }

window.onSpotifyWebPlaybackSDKReady = () => {
  console.log("Spotify Web Playback SDK is ready!");

  player = new Spotify.Player({
    name: "Music4U Player",
    getOAuthToken: (cb) => {
      cb(token); // Spotify API에서 가져온 액세스 토큰
    },
    volume: 0.5,
  });

  player.addListener("ready", ({ device_id }) => {
    console.log("Ready with Device ID", device_id);
    deviceId = device_id;
  });

  player.addListener("not_ready", ({ device_id }) => {
    console.log("Device ID has gone offline", device_id);
  });

  player.connect();
};

async function getAlbumData() {
  // const token = await getAccessToken();

  console.log(token);
  const songs = [
    { artist: "iu", track: "너의 의미" },
    { artist: "장범준", track: "봄비" },
    { artist: "Big Naughty", track: "Vancouver" },
    { artist: "kendrick lamar", track: "luther" },
    { artist: "kendrick lamar", track: "not like us" },
    { artist: "방탄소년단", track: "blue&grey" },
    { artist: "잔나비", track: "November Rain" },
    { artist: "Big Naughty", track: "IMFP" },
    { artist: "로이킴", track: "내게 사랑이 뭐냐고 물어본다면" },
    { artist: "j-hope", track: "Sweet Dreams" },
    { artist: "sza", track: "kill bill" },
    { artist: "이하이", track: "For You" },
    { artist: "XXXTENTACION", track: "Jocelyn Flores" },
    { artist: "Lil Nas X", track: "Star walkin" },
    { artist: "코드 쿤스트", track: "사라진 모든 것들에게" },
    { artist: "kanye west", track: "runaway" },
    { artist: "Post Malone", track: "Mourning" },
    { artist: "t-pain", track: "5o'clock" },
    { artist: "oasis", track: "champagne supernova-remastered" },
    { artist: "Big Naughty", track: "마지막 시" },
    { artist: "iu", track: "비밀의 화원" },
    { artist: "Big Naughty", track: "마침표" },
    { artist: "kendrick lamar", track: "tv off" },
    { artist: "oasis", track: "wonderwall-remastered" },
    { artist: "Big Naughty", track: "Joker" },
    { artist: "bigbang", track: "bad boy" },
    { artist: "bigbang", track: "cafe" },
    { artist: "아이유", track: "밤편지" },
    { artist: "헤이즈", track: "dispatch" },
    { artist: "league of legends", track: "remix rumble" },
    { artist: "헤이즈", track: "and july" },
    { artist: "비와이", track: "초월" },
  ]; // 30~35개가 적당함

  const wheelElement = document.querySelector(".wheel");
  // API 호출 병렬 처리
  const promises = songs.map(async (song) => {
    const info = `artist:${song.artist}, track:${song.track}`;
    const response = await axios.get(
      `https://api.spotify.com/v1/search?q=${info}&type=track`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    // DOM 요소 생성
    const wheelCard = document.createElement("div");
    wheelCard.classList.add("wheel__card");
    wheelCard.style.visibility = "hidden"; // 초기 상태: 숨김

    const img = document.createElement("img");
    const albumUrl = response.data.tracks.items[0].album.images[0].url;

    img.src = albumUrl;

    // 노래 제목, 앨범 제목, 아티스트 이름 가져오기
    const trackName = response.data.tracks.items[0].name; // 노래 제목
    const albumName = response.data.tracks.items[0].album.name; // 앨범 제목
    const artists = response.data.tracks.items[0].artists.map(
      (artist) => artist.name
    ); // 아티스트 이름 배열
    const trackUri = response.data.tracks.items[0].uri; //trackUri

    // data-* 속성에 데이터 저장
    wheelCard.dataset.trackName = trackName; // 노래 제목 저장
    wheelCard.dataset.albumName = albumName; // 앨범 제목 저장
    wheelCard.dataset.artists = artists.join(", "); // 아티스트 이름 저장 (쉼표로 구분)
    wheelCard.dataset.trackUri = trackUri; // trackUri 저장
    wheelCard.appendChild(img);
    wheelElement.appendChild(wheelCard);
  });

  // 모든 API 호출이 완료될 때까지 대기
  await Promise.all(promises);
  // 모든 wheel__card를 보이도록 설정
  const wheelCards = document.querySelectorAll(".wheel__card");
  wheelCards.forEach((card) => {
    card.style.visibility = "visible";
  });

  // images와 cards 배열 업데이트
  images = gsap.utils.toArray(".wheel__card");
  cards = gsap.utils.toArray(".wheel__card");

  // GSAP 설정 재적용
  setup();

  // 이벤트 리스너 재적용
  cards.forEach((card) => card.addEventListener("click", onClickCard));

  // 캐러셀 회전 시작
  startWheelRotation();
}

getAlbumData();

async function playTrack(trackUri) {
  if (!deviceId) {
    console.error("Device ID is not ready yet.");
    alert("Spotify Player is not ready yet. Please wait a moment.");
    return;
  }

  try {
    await axios.put(
      `https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`,
      {
        uris: [trackUri], // 재생할 트랙의 URI
      },
      {
        headers: {
          Authorization: `Bearer ${token}`, // Spotify 액세스 토큰
        },
      }
    );
    console.log(`Playing track: ${trackUri}`);
    isPlaying = true; // 로컬 상태 업데이트
  } catch (error) {
    console.error("Error playing track:", error);
  }
}

async function pauseTrack() {
  if (!deviceId) {
    console.error("Device ID is not ready yet.");
    return;
  }

  try {
    await axios.put(
      `https://api.spotify.com/v1/me/player/pause?device_id=${deviceId}`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`, // Spotify 액세스 토큰
        },
      }
    );
    console.log("Playback paused.");
    isPlaying = false; // 로컬 상태 업데이트
  } catch (error) {
    console.error("Error pausing track:", error);
  }
}

//캐러셀 생성 gsap

gsap.registerPlugin(Draggable, Flip);

let wheel = document.querySelector(".wheel"),
  images = gsap.utils.toArray(".wheel__card"),
  cards = gsap.utils.toArray(".wheel__card"),
  header = document.querySelector(".header"),
  currentCard; // keep track of last clicked card so we can put it back

function setup() {
  let radius = wheel.offsetWidth / 2,
    center = radius,
    slice = 360 / images.length,
    DEG2RAD = Math.PI / 180;
  gsap.set(images, {
    x: (i) => center + radius * Math.sin(i * slice * DEG2RAD),
    y: (i) => center - radius * Math.cos(i * slice * DEG2RAD),
    rotation: (i) => i * slice,
    xPercent: -50,
    yPercent: -50,
  });
}

window.addEventListener("resize", setup);
//휠 로테이션 시작
function startWheelRotation() {
  gsap.to(wheel, {
    rotation: "+=360", // 계속 회전
    ease: "none", // 일정한 속도로 회전
    duration: images.length * 8, // 한 바퀴 도는 시간
    repeat: -1, // 무한 반복
    overwrite: false, // 기존 애니메이션 덮어쓰기 방지
  });
}
// Draggable 설정
Draggable.create(wheel, {
  allowContextMenu: true,
  type: "rotation",
  trigger: wheel,
  inertia: true, // 관성 효과 활성화
  onDragStart: function () {
    // 드래그가 시작되면 기존 애니메이션 중단
    gsap.killTweensOf(wheel);
  },
  onDragEnd: function () {
    // 드래그가 끝난 후 애니메이션 다시 시작
    startWheelRotation();
  },
});

cards.forEach((card) => card.addEventListener("click", onClickCard));

header.addEventListener("click", (event) => {
  // 클릭한 요소가 버튼 내부인지 확인
  if (
    event.target.closest("#playPauseButton") ||
    event.target.closest("#prevButton") ||
    event.target.closest("#nextButton")
  ) {
    return; // 버튼 클릭 시 헤더 이벤트 무시
  }

  closeCurrentCard(); // 헤더 클릭 시 카드 닫기
});

function onClickCard({ currentTarget }) {
  const card = currentTarget;
  const testImg = document.querySelector(".testImg");
  const trackName = document.querySelector(".trackName");
  const albumName = document.querySelector(".albumName");
  const artists = document.querySelector(".artists");
  const testInfo = document.querySelector(".testInfo");

  if (card !== currentCard) {
    // 다른 카드를 클릭한 경우
    closeCurrentCard(); // 기존 카드 닫기
    currentCard = card;

    // 이미지 이동
    const image = card.querySelector("img");
    const state = Flip.getState(image);
    testImg.appendChild(image);
    trackName.innerHTML = card.dataset.trackName;
    albumName.innerHTML = card.dataset.albumName;
    artists.innerHTML = card.dataset.artists;

    // Spotify 트랙 재생
    const trackUri = card.dataset.trackUri;
    if (trackUri) {
      playTrack(trackUri); // 트랙 재생
      isPlaying = true; // 재생 상태 업데이트
    } else {
      console.log("No track URI available for this card.");
    }

    // testInfo 보이기
    if (testInfo) {
      testInfo.classList.add("visible");
    }

    Flip.from(state, {
      duration: 0.5,
      scale: true,
      ease: "power1.inOut",
    });
  } else {
    // 같은 카드를 클릭한 경우 (닫기)
    closeCurrentCard();
  }

  startWheelRotation(); // 캐러셀 회전 유지
}
function closeCurrentCard() {
  if (currentCard) {
    const header = document.querySelector(".header");
    const img = header.querySelector("img");

    // 이미지 원래 카드로 이동
    const state = Flip.getState(img);
    currentCard.appendChild(img);

    Flip.from(state, {
      duration: 0.5,
      scale: true,
      ease: "power1.inOut",
    });

    // Spotify 트랙 정지
    pauseTrack();
    isPlaying = false; // 재생 상태 업데이트

    // testInfo 숨기기
    const testInfo = document.querySelector(".testInfo");
    if (testInfo) {
      testInfo.classList.remove("visible");
    }

    currentCard = null;
  }
}

async function getPlaybackState() {
  try {
    const response = await axios.get("https://api.spotify.com/v1/me/player", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data.is_playing; // 현재 재생 상태 반환
  } catch (error) {
    console.error("Error fetching playback state:", error);
    return false; // 기본값으로 false 반환
  }
}

// 재생/일시정지 버튼
document
  .getElementById("playPauseButton")
  .addEventListener("click", async (event) => {
    event.stopPropagation(); // 이벤트 전파 중단

    if (!currentCard) {
      alert("카드를 먼저 선택하세요!");
      return;
    }

    const trackUri = currentCard.dataset.trackUri;

    // Spotify API에서 현재 재생 상태 확인
    const isCurrentlyPlaying = await getPlaybackState();

    if (isCurrentlyPlaying) {
      pauseTrack(); // 음악 정지
      isPlaying = false;
    } else {
      playTrack(trackUri); // 음악 재생
      isPlaying = true;
    }
  });

// 이전 카드 버튼
document.getElementById("prevButton").addEventListener("click", (event) => {
  event.stopPropagation(); // 이벤트 전파 중단
  if (!currentCard) {
    alert("카드를 먼저 선택하세요!");
    return;
  }

  const cards = document.querySelectorAll(".wheel__card");
  const currentIndex = Array.from(cards).indexOf(currentCard);
  const prevIndex = (currentIndex - 1 + cards.length) % cards.length; // 왼쪽 카드 인덱스
  const prevCard = cards[prevIndex];

  // 이전 카드 클릭 처리
  onClickCard({ currentTarget: prevCard });
});

// 다음 카드 버튼
document.getElementById("nextButton").addEventListener("click", (event) => {
  event.stopPropagation(); // 이벤트 전파 중단
  if (!currentCard) {
    alert("카드를 먼저 선택하세요!");
    return;
  }

  const cards = document.querySelectorAll(".wheel__card");
  const currentIndex = Array.from(cards).indexOf(currentCard);
  const nextIndex = (currentIndex + 1) % cards.length; // 오른쪽 카드 인덱스
  const nextCard = cards[nextIndex];

  // 다음 카드 클릭 처리
  onClickCard({ currentTarget: nextCard });
});
