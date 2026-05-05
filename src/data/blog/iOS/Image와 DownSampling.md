---
title: "Image와 DownSampling"
description: "iOS에서 Image는 어떻게 메모리에 올라가는지 알아보자"
pubDatetime: 2026-05-05T20:20:00+09:00
tags: ["iOS", "Image", "Swift"]
category: "iOS"
lang: "ko"
timezone: "Asia/Seoul"
---

## Table of contents

# iOS에서의 Image

이 글에서는 가장 흔한 jpeg 기준으로 글을 작성하겠음.

서버에서 이미지를 받거나 인터넷에서 이미지 하나 다운로드 받아보면

매우 작다. 1000 X 1000이면 이미지마다 다르겠지만 1MB를 넘지 않음.

그럼 그냥 이미지 메모리에 적재시면 안됨? -> 안됨

왜냐하면 우리가 파일로 들고 있는 이미지는 압축된 파일이기 때문.

예를 들어서 수식도 같다.

우리가 같은 수를 N 번 더하는 것을 곱셈이라고 했듯

325 X 4 는 압축 된 것이고

실제로는 325 + 325 + 325 + 325 이다.

이미지도 그렇다. jpeg도 압축된 파일이다.

jpeg 압축과정은 [영상](https://youtu.be/tHvZngU14jE?si=l4Vji41ahEHxhsxT) 설명이 기깔나므로 대체함.

그럼 만약 1000 X 1000 픽셀의 이미지를 메모리에 올리면 어떻게 될까?

1 픽셀당 R G B A 총 개의 데이터가 들어가고 각 데이터당 1byte가 들어감.

그럼 1 픽셀당 4 bytes의 데이터가 필요한 것임

그럼 1000 X 1000 X 4 bytes = 4,000,000 bytes 대략 4MB임.

난 몇 kb의 이미지 1개 로딩했을 뿐인데 메모리는 4MB를 차지함.

그럼 이 문제를 어떻게 해결할까?

# 다운샘플링, DownSampling

만약 서버에서 1000 X 1000 짜리 jpeg 이미지를 내려주었다 가정함

하지만 나는 이미지를 30pt X 30pt 에 작게 띄울 거라면?

1pt = 3px 이니깐 90px X 90px 만 필요한 상황임.

그럼 1000 X 1000 짜리를 모두 메모리에 싣는건 바보같은 짓임.

필요한 만큼만 이미지를 디코딩하면 됨. 그게 바로 다운샘플링 DownSampling임.

```swift
import ImageIO

func downsample(imageAt imageURL: URL,
                to pointSize: CGSize,
                scale: CGFloat = UIScreen.main.scale) -> UIImage? {

    // 1. 이미지 소스 생성 — 디코딩된 형태로 캐시하지 않음
    let imageSourceOptions = [kCGImageSourceShouldCache: false] as CFDictionary
    guard let imageSource = CGImageSourceCreateWithURL(imageURL as CFURL, imageSourceOptions) else {
        return nil
    }

    // 2. 목표 픽셀 크기 계산 (포인트 × 스케일 팩터)
    let maxDimensionInPixels = max(pointSize.width, pointSize.height) * scale

    // 3. 다운샘플링 옵션 설정
    let downsampleOptions = [
        kCGImageSourceCreateThumbnailFromImageAlways: true,
        kCGImageSourceShouldCacheImmediately: true,
        kCGImageSourceCreateThumbnailWithTransform: true,
        kCGImageSourceThumbnailMaxPixelSize: maxDimensionInPixels
    ] as CFDictionary

    // 4. 다운샘플링된 썸네일 생성
    guard let downsampledImage = CGImageSourceCreateThumbnailAtIndex(
        imageSource, 0, downsampleOptions
    ) else {
        return nil
    }

    return UIImage(cgImage: downsampledImage)
}
```

이제 하나씩 뜯고 맛보자.

| 옵션                                           | 값      | 설명                                                                                |
| ---------------------------------------------- | ------- | ----------------------------------------------------------------------------------- |
| `kCGImageSourceShouldCache`                    | `false` | CGImageSource 생성 시 이미지를 디코딩된 형태로 캐시하지 않음. 원본 전체 디코딩 방지 |
| `kCGImageSourceShouldCacheImmediately`         | `true`  | 다운샘플링 시점에 바로 디코딩 수행. CPU hit 시점을 명시적으로 제어                  |
| `kCGImageSourceCreateThumbnailWithTransform`   | `true`  | 원본 이미지의 EXIF orientation 정보를 반영하여 올바른 방향으로 생성                 |
| `kCGImageSourceCreateThumbnailFromImageAlways` | `true`  | 내장 썸네일이 없더라도 항상 원본에서 썸네일 생성                                    |
| `kCGImageSourceThumbnailMaxPixelSize`          | 픽셀 값 | 결과 이미지의 최대 픽셀 크기 (가로/세로 중 큰 값 기준)                              |

옵션 값 대로 설명에 부족함이 없지만 `kCGImageSourceShouldCacheImmediately`는 다시보자.

이미지 디코딩 시점을 정한다는 건 어떤 의미인가?

## iOS 이미지 디코딩 타이밍

UIImage를 만든 순간 이미지가 디코딩에 들어갈 것이라 생각하지만

UIImage의 이미지가 디코딩이 되는 순간 첫 스크린에 나올 때임.

즉 이미지 실컷 줄여서 미리 디코딩 해 놓은거라 생각했겠지만 아님.

그래서 `kCGImageSourceShouldCacheImmediately`로 이미지를 즉시 디코딩하는 것임

다른 방식으로 UIImage 함수 `preparingForDisplay()`로 즉시 디코딩을 시킬 수 있음.

**이게 왜 필요함?**

이미지가 1개라면 문제가 되지 않지만 이미지가 CollectionView에 한 번에 보여되는 상황이면

즉시 즉시 디코딩을 해줘야 뒷탈이 없음.

# 그럼 UIImage로 띄운 후에 Resizing 하는 것과 뭐가 달라?

UIImage로 띄운 후에 Resizing은 아예 이야기가 다른 거임

UIImage로 띄운 후에 Resizing을 하려면 UIImage를 우선 디코딩을 후에 Resizing이 되어야함.

그러니깐 1000 X 1000 이미지를 UIImage에 넣고 90 X 90으로 줄인다 하더라도

이미 한 번은 1000 X 1000 약 4MB가 이미지에 올라갔다가 사라지는 것임.

# 그럼 다운샘플링은 필수?

그렇지 않음. 필수가 아님

왜냐하면 이미지와 실제 그려야하는 픽셀 수 차이가 많지 않다면

약속된 압축 방식을 디코딩하는게 훨씬 효율적일 수 있음.

메모리는 완벽한 최적화는 아니지만 디코딩하는건 CPU 소비가 됨으로.

그러니 적절하게 판단해서 사용해야 함.
