---
title: “RunLoop"
description: “Deep dive into RunLoop"
pubDatetime: 2026-05-05T19:32:00Z
tags: ["iOS", “RunLoop", “Swift"]
category: "iOS"
lang: "ko"
timezone: “Asia/Seoul"
---

# RunLoop

## RunLoop란 무엇인가?
RunLoop는 `Run(Event)`을 처리하기 위해 계속 돌아가는 `Loop`다.

**왜 계속 돌아가야 할까?**

기본적으로 스레드는 주어진 작업을 마치면 종료하게 된다.

하지만 메인 스레드는 그럴 수가 없다. 항시 사용자의 반응을 기다려야 한다.

RunLoop는 처리할 이벤트가 있으면 스레드를 깨워서(`종료된걸 가져온다`가 아님) 일을 시키고

이벤트가 없으면 쉬게(`종료`가 아님)만들어 시스템 자원을 효율적으로 관리하는 것임.

- 스레드를 생성하고 종료시키는 것은 여기에서는 큰 오버헤드임.(터치는 즉각적으로 반응해야 하니깐)
- 여기서 스레드의 여러 형태가 나오는데 단어마다 느낌이 조금씩 다르니 유의.

## 메인 스레드의 RunLoop는 알겠는데 다른 스레드는?
RunLoop는 스레드당 1개를 가질 수 있고 명시하지 않으면 (코드로 언급하는 것) 생성되지 않음.

엥 그럼 메인 스레드는?

메인 스레드의 RunLoop는 UIApplication이 만들어지는 시점에서 만들어지고 UI터치 등 다양한 걸 부여 받음.

그럼 백그라운드 스레드에 RunLoop를 생성 안하면 스레드가 종료됨?

그렇지는 않음 스레드 풀(Thread Pool)에서 관리가 됨.

스레드가 할 일이 끝났다? -> 스레드 풀에 입성, 스레드는 Idle(유휴 상태)가 됨.

여기서 주의해야할 점은 GCD의 스레드 풀과 Swift Concurrency의 스레드 풀은 다름.

모두 스레드를 Idle 상태로 만들어서 관리하는 것은 맞으나

GCD는 요청대로 생성하여서 스레드 폭발이 일어나지만 

Swift Concurrency는 실제 운용할 수 있는 코어 수 만큼만 만들어서 관리함.

# RunLoop와 화면 그리는 상관관계

RunLoop는 화면을 직접 그리지 않음.

다만 RunLoop가 한 번순회를 돌면서 변경사항을 모아서 한번에 

`코어 애니메이션`에 넘겨서 그리도록 명령함. (이걸 commit이라고 함)

그럼 그려야할 부분을 어떻게 암? -> 다시 그려야 하는 부분에 깃발을 꽂아둬서 기억함.

## 살짝 깊게 들어가보자
Main Thread는 종료되지 않는다. 다만 Sleep 잠들 뿐

그럼 언제 commit이 이뤄질까?

코어 애니메이션은 Main Loop에 Observer를 등록해 두었음.

Loop가 싸이클을 돌고 Sleep에 들기 직전(kCFRunLoopBeforeWaiting)에 반응하여

UI Update Cycle을 돎.

UI Update Cycle을 순회해야 RunLoop가 Sleep됨.

## UI Update Cycle
1. Layout
- 깃발이 꽂힌 뷰를 찾아 layoutSubViews를 호출한다 여기서 AutoLayout 제약 조건이 계산되고
View의 최종 frame과 bounds가 계산됨.
2. Display
  깃발이 꽂힌 뷰들의 draw 메소드가 호출된다. (단 직접 )
3. Prepare
  이미지 디코딩이나 포맷 변화 등 GPU 렌더링 전 필요 조치
4. Commit
  계산이 완료된 뷰 계층 구조를 직렬화하여 앱 프로세스를 벗어나 Render Server로 전송
Render Server는 별도의 시스템 프로세스다.

## layoutIfNeeded, setNeedsLayout
우리가 흔히 layoutIfNeed는 즉시 UI업데이트를 요청한다.

setNeedsLayout은 다음 UI업데이트 때 UI업데이트를 요청한다. 라고 안다.

이 개념을 RunLoop와 UI Update Cycle에 섞어보자.

RunLoop가 순회하면서 UI Update가 필요한 부분에 깃발을 꽂는다고 했음.

그리고 RunLoop가 sleep 들기 직전에 UI Update Cycle을 돈다고 했음.

layoutIfNeeded는 `지금 꽂은 깃발 즉시 UI Update Cycle 돌아.` 를 명령하는 것임.

### 아주 조금 깊게.

A View UI Update -> B View Update 순서로 동작하고 I

B View Update에서 layoutIfNeeded를 순회하면 A 에 꽂힌 깃발도 동작할까?

A가 B의 자식이 아닌 이상 업데이트 되지 않는다.

B에서 layoutIfNeeded를 호출 했다는 것은 B에 layoutSubViews를 호출한다는 것이고

이는 B와 B의 자식 View의 깃발만 UI Update Cycle에 태운다는 걸 의미함.

## setNeedsLayout은 그럼 왜 필요할까?
그럼 어짜피 UIUpdate는 자동으로 깃발을 꽂아주는데 왜 setNeedsLayout이 필요할까?

이는 특정 변수가 바뀌었을 때에 화면의 배치가 달리지는 경우 시스템은 이를 알지를 못함.

이 때 수동으로 알려줘야함.

```swift
class ExpandableProfileView: UIView {
    
    // 1. 커스텀 상태 프로퍼티
    var isExpanded: Bool = false {
        didSet {
            // 값이 변경되었을 때, 뷰의 UI 업데이트가 필요하다면?
            // 시스템은 isExpanded가 레이아웃을 바꾸는지 모르기 때문에 수동으로 호출해야 합니다.
            setNeedsLayout() 
        }
    }
    
    override func layoutSubviews() {
        super.layoutSubviews()
        
        // 2. isExpanded 상태에 따라 서브뷰들의 프레임을 직접 분기 처리하여 계산
        if isExpanded {
            descriptionLabel.frame = CGRect(x: 0, y: 50, width: bounds.width, height: 100)
        } else {
            descriptionLabel.frame = CGRect(x: 0, y: 50, width: bounds.width, height: 0)
        }
    }
}
```

## layoutSubView의 호출의 의미
UI Update Cycle를 순회한다는 것은 layoutSubView 함수를 호출한다는 것임

layoutSubView는 Top-down 방식임.

부모 View에서 자식 View의 frame를 결정하고 또 그 자식의 View를 결정하는 방식임.

### 자식 View frame을 어떻게 앎? - AutoLayout Render Loop
자식의 View의 frame은 어떻게 측정할까?

여기서 등장하는게 AutoLayout Render Loop 임.

생뚱맞은 개념이 아니라 UI Update Cycle 내 포함된 단계임.

1. Update Pass (제약 조건 업데이트)
   - Bottom-Up
   - updateConstraints() 를 호출해 AutoLayout 계산함.
2. Layout Pass (뷰 프레임 배치)
   - Top-Down
   - layoutSubviews() 를 호출하여 자신의 크기를 확정 짓고 자식 View를 frame&bounds 셋팅하며 내려감.
   - 여기서 frame&bounds를 셋팅한다? -> 깃발이 꽂힌다.
3. Display Pass (화면 그리기) (직접 오버라이딩하지 않으면 Skip)
   - Top-Down
   - draw()로 실제 픽셀단위로 그려내려가면서 자식 View로 내려감.
   - draw는 GPU가 아닌 CPU가 그리므로 속도가 느림
   - 실제로 draw를 override 하고 빈 함수만 구현해도 무겁게 작업함

# 정리
그렇게 Main RunLoop는 돌면서 깃발을 꽂고 Commit하여 GPU의 도움을 받아서 동작한다.
