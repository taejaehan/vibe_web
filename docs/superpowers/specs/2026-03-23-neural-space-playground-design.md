# Neural Space — 딥러닝 3D 임베딩 플레이그라운드

## Overview

2D 분류 데이터가 뉴럴 네트워크의 각 레이어를 통과하면서 3D 공간에서 어떻게 변환되는지 실시간으로 시각화하는 인터랙티브 플레이그라운드. TensorFlow Playground가 2D 결정 경계를 보여준다면, Neural Space는 레이어별 활성화 공간을 3D 점 구름으로 보여준다.

## Constants / Limits

- **NUM_POINTS**: 200 (데이터 포인트 수, 고정)
- **MAX_EPOCHS**: 200
- **SNAPSHOT_INTERVAL**: 5 epochs (총 스냅샷 최대 40개)
- **MAX_HIDDEN_LAYERS**: 4
- **NODES_RANGE**: 2~8 per layer

## Tech Stack

- **TensorFlow.js** — 브라우저에서 실제 모델 학습
- **Canvas 2D** — 3D 원근 투영 점 구름 렌더링 (vibe_web 셀과 동일 기법)
- **Vite + Vanilla JS** — 경량 빌드
- **Vercel** — 정적 배포

## Layout: 수평 파이프라인

```
┌─────────┬──────────────────────────────────────────────┐
│         │  [Epoch Timeline Slider]            45/100   │
│ Controls├──────────────────────────────────────────────┤
│         │                                              │
│ Dataset │  Input → Hidden1 → Hidden2 → Output          │
│ Activ.  │  [3D]     [3D]     [3D]     [3D]            │
│ LR      │                                              │
│ Layers  │  각 패널: 3D 원근 투영 점 구름               │
│ Nodes   │  카메라 자동 회전 + 레이블별 색상             │
│ Speed   │                                              │
│         ├──────────────────────────────────────────────┤
│ [Train] │  [Loss Chart]                        0.12    │
│ [Reset] │                                              │
└─────────┴──────────────────────────────────────────────┘
```

## Controls (왼쪽 사이드바)

### Dataset 선택
- Spiral (나선형, 2클래스)
- Circle (동심원, 2클래스)
- XOR (4분면 교차, 2클래스)
- Moons (초승달, 2클래스)
- Gaussian Clusters (가우시안 뭉치, 2클래스)
- 버튼 그룹으로 선택, 선택 시 데이터 재생성

### Activation 함수
- ReLU / Sigmoid / Tanh
- 버튼 그룹, 변경 시 모델 재구성

### Learning Rate
- 슬라이더: 0.001 ~ 1.0 (로그 스케일)
- 현재 값 표시

### Hidden Layers
- +/- 버튼으로 레이어 수 조절 (1~4개)
- 레이어 추가/제거 시 3D 뷰 패널도 동적으로 추가/제거

### 레이어별 노드 수
- 각 히든 레이어마다 +/- 또는 작은 슬라이더 (2~8개)
- 노드 수 변경 시 모델 재구성

### Speed
- 1x / 2x / 5x 버튼
- 1x = 1 epoch per requestAnimationFrame tick, 2x = 2 epochs per tick, 5x = 5 epochs per tick
- 각 epoch = 전체 데이터셋 1회 학습 (full batch)

### Train / Reset 버튼
- Train: 학습 시작/일시정지 토글
- Reset: 모델 가중치 초기화, epoch 0으로

## Main Area: 3D 점 구름 파이프라인

### 구성
- Input → Hidden 1 → ... → Hidden N → Output 순서로 가로 배치
- 레이어 사이에 화살표(→)로 흐름 표시
- 히든 레이어 수에 따라 패널 수 동적 변경

### 각 3D 패널
- 상단 좌측: 레이어 이름 (Input, Hidden 1, ...)
- 상단 우측: 차원 정보 (2D, 4 nodes, ...)
- 중앙: 3D 원근 투영 점 구름
  - 각 데이터 포인트를 해당 레이어의 활성화 값으로 좌표 매핑
  - 1 node: 수평 1D 스트립 — x축에 활성화 값, y는 랜덤 jitter로 분산
  - 2 nodes: z=0으로 고정, 같은 3D 뷰포트에서 평면 렌더링
  - 3 nodes: 3D (x, y, z) 그대로
  - 4+ nodes: 처음 3개 차원을 x/y/z로 사용
  - 클래스별 네온 색상으로 구분
  - 깊이에 따라 점 크기/투명도 조절
  - 카메라 Y축 자동 회전
  - glow 효과

### 좌표 정규화
- 각 레이어의 활성화 값은 per-dimension min-max 정규화로 [-1, 1] 범위에 매핑
- 매 epoch마다 현재 활성화 값 기준으로 재계산

### 3D 투영 방식
- 참조 구현: `projects/shuzzi-mnist/main.js` (원근 투영 로직)
- 3D 좌표 → 카메라 회전(Y축) → 틸트(X축) → perspective divide → 2D Canvas

## Epoch Timeline

- 상단 바에 슬라이더
- 학습 중: 현재 epoch 표시, 실시간 진행
- 학습 완료 후: 슬라이더를 드래그해서 특정 epoch 시점의 임베딩 상태로 돌아가기
- 구현: 매 epoch마다 각 레이어의 활성화 값 스냅샷을 저장 (메모리 고려하여 N epoch 간격으로)

## Loss Chart

- 하단 바에 라인 차트
- X축: epoch, Y축: loss
- 실시간 업데이트
- Canvas 2D로 간단하게 렌더링

## Data Flow

1. 사용자가 데이터셋/네트워크 구조/파라미터 설정
2. Train 클릭 → TensorFlow.js로 모델 생성 및 학습 시작
3. 매 epoch:
   a. 학습 데이터로 1 epoch 학습
   b. 전체 데이터를 모델에 통과시키며 각 레이어 활성화 값 추출
   c. 활성화 값을 3D 좌표로 변환
   d. 각 패널의 점 구름 업데이트
   e. Loss 값 차트에 추가
   f. 스냅샷 저장 (5 epoch 간격)
4. 학습 완료 후 epoch 슬라이더로 히스토리 탐색

## Activation 추출

TensorFlow.js에서 중간 레이어 출력 추출:
```javascript
// 모델 구성 시 한 번만 서브모델 생성 (매 epoch 재생성 금지)
const layerModels = model.layers.map(layer =>
  tf.model({ inputs: model.input, outputs: layer.output })
)

// 매 epoch: tf.tidy()로 감싸서 텐서 누수 방지
const activations = tf.tidy(() =>
  layerModels.map(m => m.predict(inputData).arraySync())
)
```

### 모델 구성
- **Output layer**: 1 node + sigmoid activation
- **Loss**: binaryCrossentropy
- **Optimizer**: Adam
- **Batch size**: full batch (전체 데이터셋 한 번에)

### 구조 변경 시 동작
Activation, 레이어 수, 노드 수 변경 시:
1. 학습 중지
2. 새 구조로 모델 재구성 (서브모델도 재생성)
3. Epoch 0으로 리셋
4. 스냅샷 히스토리 초기화

## Visual Style

- vibe_web MNIST 셀과 동일한 네온 톤
- 어두운 배경 (#0a0a1a)
- 네온 색상 팔레트: cyan, magenta 2색 (2클래스)
- glow 효과 (shadowBlur)
- 깊이 기반 크기/투명도 변화

## 배포 및 연동

- 별도 레포 또는 vibe_web 내 서브 프로젝트로 생성
- Vercel에 배포
- 배포 URL을 vibe_web의 `data/shuzzi-mnist.json`의 `url` 필드에 연결
- Canvas 셀 클릭 시 Neural Space 페이지로 이동

## 키보드 단축키

- **Space**: Train/Pause 토글
- **←/→**: 학습 일시정지 상태에서 epoch 스크러빙

## 데이터셋 생성 알고리즘

- **Spiral**: `angle = i/n * 4π + class * π`, `r = i/n`, `x = r*cos(angle) + noise`, `y = r*sin(angle) + noise`
- **Circle**: 내부 원 (r < 0.5) vs 외부 원 (0.5 < r < 1.0)
- **XOR**: 4분면 기반, (x>0 XOR y>0)로 클래스 결정
- **Moons**: sklearn make_moons 방식 — 상반원 `(cos(θ), sin(θ))`, 하반원 `(1-cos(θ), 1-sin(θ)-0.5)`
- **Clusters**: 2개 가우시안 분포, 중심 (-0.5, -0.5), (0.5, 0.5), σ=0.2

## Scope 제외

- 모바일 최적화 (PC 우선)
- 다중 클래스 (2클래스로 고정)
- 커스텀 데이터셋 업로드
- 모델 저장/불러오기
