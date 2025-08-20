# API 목록

| API | Method | 성공 상태 코드 | 실패 상태 코드 | 기본 오류 메시지 |
| --- | ------ | ------------- | -------------- | ---------------- |
| `/api/login` | `POST` | `200` | `400`, `401`, `500` | `아이디 또는 비밀번호를 확인해주세요.` |
| `/api/register` | `POST` | `201` | `400`, `409`, `500` | `회원가입 중 오류가 발생했습니다.` |
| `/api/check-id/{login_id}` | `GET` | `200` | `400`, `409` | `아이디가 이미 존재합니다.` |

## 공통 오류 응답 예시

### JSON 예시
```json
{
  "success": false,
  "message": "오류 메시지"
}
```

### JSON 스키마
```json
{
  "type": "object",
  "required": ["success", "message"],
  "properties": {
    "success": {
      "type": "boolean",
      "description": "요청 성공 여부 (항상 false)"
    },
    "message": {
      "type": "string",
      "description": "오류에 대한 설명"
    }
  }
}
```
