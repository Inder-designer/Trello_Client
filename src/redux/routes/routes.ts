// Auth
export const LOGIN = "/auth/login"
export const LOGOUT = "/auth/logout"
export const REGISTER = "/auth/signup"
export const FORGOT_PASSWORD = "/auth/forgot-password"
export const OTP_VERIFY = "/auth/verify-otp"
export const RESET_PASSWORD = "/auth/reset-password"

// User
export const USER_GET = "/user"
export const USER_UPDATE = "/user/update"
export const USER_CHANGE_PASSWORD = "/user/change-password"

// Board
export const BOARD_GET_ALL = "/board/all"
export const BOARD_CREATE = "/board/new"
export const BOARD_DELETE = (id: string) => `/board/${id}`
export const BOARD_CLOSE_TOGGLE = (id: string) => `/board/${id}`
export const BOARD_UPDATE = (id: string) => `/board/${id}`
export const BOARD_GET = (id: string) => `/board/${id}`
export const BOARD_LEAVE = (id: string) => `/board/leave/${id}`

// Invite
export const REQUEST_JOIN = `/board/request-join`
export const REQUEST_STATUS = (id: string) => `/board/request-status/${id}`
export const REQUEST_ACTION = (id: string) => `/board/request-join/${id}`
export const INVITE_GENERATE = (id: string) => `/board/generate-invite-token/${id}`
export const INVITE_LINK_VERIFY = `/board/verify-invite-token`
export const INVITE_ACCEPT = `/board/join-with-token`
export const INVITE_LINK_DELETE = (id: string) => `/board/delete-invite-token/${id}`

// List
export const LIST_CREATE = "/board/add-list"
export const LIST_UPDATE = (id: string) => `/board/update-list/${id}`
export const LIST_DELETE = (id: string) => `/board/delete-list/${id}`

// Card
export const CARD_CREATE = "/board/add-card"
export const CARD_UPDATE = (id: string) => `/board/update-card/${id}`
export const CARD_DELETE = (id: string) => `/board/delete-card/${id}`
export const CARD_MOVE = (id: string) => `/board/move-card/${id}`
export const CARD_GET_ALL = (id: string) => `/board/cards/${id}`
export const CARD_GET = (id: string) => `/board/card/${id}`
export const CARD_COMMENT_ADD = `/add-comment`
export const CARD_COMMENT_DELETE = `/delete-comment`
export const CARD_COMMENT_REACT = `/react-comment`

export const NOTIFICATION_GET = `/notifications`
export const NOTIFICATION_READ = `/notification/read`

// Upload
export const UPLOAD_SINGLE = "/upload-single"
export const UPLOAD_MULTI = "/upload-multiple"

// partner
export const PARTNER_REGISTER = "/user/register-partner"