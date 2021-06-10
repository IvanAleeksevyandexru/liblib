export interface SnippetModel {
  lastName?: string;
  firstName?: string;
  middleName?: string;
  birthDate?: string;
  status?: string;
  orgName?: string;
  address?: string;
  comment?: string;
  url?: string;
  description?: string;
  uin?: string;
  sum?: string;
  payDate?: string;
  linkName?: string;
  expiryDate?: string;
  statusId?: number;
  orgId?: number;
  orgIcon?: string;
  date?: string;
  localDate?: string;
  dateAsStr?: string;
  createDate?: string;
  originalAmount?: string;
  discountDate?: string;
  attachCnt?: number;
  deptMessageType?: string;
  'geps.receiveDatetime'?: string;
  preliminaryReservationDate?: string;
  type?: string;
  parentOrderId?: number;
  id?: number;
}

export interface OrderCreator {
  firstName: string;
  lastName: string;
  middleName: string;
  formattedLoginName: string;
}

export interface FeedDataModel {
  linked_to?: string;
  parentOrderId?: number;
  imOrgName?: string;
  attachCnt?: number;
  snippets?: SnippetModel[];
  hasRegLetter?: boolean;
  orderCreator?: OrderCreator;
  orderDescription?: string;
  branch?: BranchModel;
  toDoctor?: boolean;
  expiryDate?: string;
  ipshPaymentStatus: string;
  channel?: string;
  imExpireDate?: string;
  reminder?: string;
  orderId?: string;
  gisDoSsExtId?: string;
  gisDoLink?: string;
  DiscountDate?: string;
  amount?: string;
  uin?: string;
  unreadThread?: number;
  'geps.receiveDatetime'?: string;
  needConfirm?: boolean;
  messageType?: string;
  draftAutoDeleted?: string;
}

export interface BranchModel {
  name?: string;
}


export interface FeedBannerModel {
  closed?: boolean;
  path: string;
}

export type FeedItemModel = FeedModel | FeedBannerModel;

export interface FeedModel {
  ot?: string;
  data: FeedDataModel;
  date: string;
  branchId?: number;
  unread: boolean;
  hasQuiz?: boolean;
  mobileTitle?: string;
  title: string;
  ownerId?: number;
  userId: number;
  subTitle?: string;
  feedType: string;
  id: number;
  extId: string;
  status: string;
  hasLegal?: boolean;
  isLegal?: boolean;
  deleteError?: boolean;
  archive?: boolean;
  // кастомные поля
  selected?: boolean;
  detail?: FeedDetailModel;
  removeInProgress?: boolean;
  needAccept?: boolean;
  servicePassportId?: string;
}

export interface FeedsModel {
  hasMore?: boolean;
  items?: FeedModel[];
}

export interface FeedsCategory {
  text: string;
  type: string;
  id: number;
}

export interface FeedsParams {
  isEqueue?: boolean;
  types: string | null;
  pageSize: string;
  status?: string;
  startDate?: string;
  lastFeedId?: string;
  lastFeedDate?: Date | string;
  q?: string;
  unread?: boolean;
  isArchive?: boolean;
  isHide?: boolean | string | null;
}

// TODO: уточнить тип данных
export interface FeedDetailModel {
  additionalData?: any;
  agencyName?: any;
  allowNps?: boolean;
  appealed?: any;
  archived?: boolean;
  baseMessageId?: any;
  daysLeft?: any;
  deadlineDate?: any;
  deadlinePercent?: any;
  firstMessageId?: any;
  fromName?: any;
  hasAttachments?: any;
  iconName?: string;
  messageCount?: any;
  read?: boolean;
  sendDate?: any;
  sendDateMilliseconds?: any;
  status?: string;
  statusMnemonic?: string;
  subject?: any;
  threadId?: number;
  threadType?: number;
  threadTypeName?: string;
  toName?: any;
  updateDate?: any;
  updateDateMilliseconds?: any;
  addParams?: FeedDetailParams;
  messages?: MessageDetails[];
  statusHistory?: MessageStatusHistory[];
}

export interface FeedDetailParams {
  feed_mobtitle?: string;
  feed_subtitle?: string;
  feed_title?: string;
  inner_mobtitle?: string;
  inner_subtitle?: string;
  inner_title?: string;
  template_id?: number;
  date?: string;
  regNo?: string;
  Discount?: string;
  fknumberHash?: string;
  fknumber?: string;
  bankName?: string;
  timePunishment?: string;
  number?: string;
  receiverKpp?: string;
  receiverInn?: string;
  departmentAdress?: string;
  model?: string;
  place?: string;
  offenceDate?: string;
  offenceNumber?: string;
  departmentName?: string;
  articleName?: string;
  linksFkNumber?: string;
  receiverName?: string;
  DiscountDate?: string;
  sts?: string;
  oktmo?: string;
  kbk?: string;
  bic?: string;
  account?: string;
  articleCode?: string;
  deptCode?: string;
  typePunishment?: string;
  amount?: string;
  deptName?: string;
  bill_date?: string;
  type_doc?: string;
  DiscountDateFull?: string;
  DiscountSize?: string;
  serviceCategory?: string;
  bill_sum?: string;
  service_template_change_bill?: string;
  bill_user_id?: string;
  number_doc?: string;
  ArticleName?: string;
  billName?: string;
  dept_id?: string;
  uin?: string;
  UIN?: string;
  sum?: string;
}

export interface MessageDetails {
  addParams?: FeedDetailParams;
  assignedUserId?: any;
  assignedUserName?: any;
  attachmentCount?: any;
  attachments?: Attachment[];
  billId?: any;
  billSourceCode?: any;
  categoryCode?: any;
  deadlineDate?: any;
  deadlinePercent?: any;
  digest?: any;
  directionCode?: string;
  disableTo?: boolean;
  employeeId?: any;
  employeeName?: any;
  eventInfo?: any;
  eventType?: string;
  fromId?: number;
  fromName?: string;
  fromOrgId?: any;
  hasLegal?: boolean;
  isActiveNotif?: boolean;
  isDeleted?: any;
  isLegal?: boolean;
  isRead?: boolean;
  isReply?: any;
  messageId?: number;
  multiSubject?: boolean;
  opponentId?: any;
  opponentName?: any;
  postalAddress?: any;
  postalReply?: boolean;
  sendDate?: string;
  sendDateMilliseconds?: number;
  signed?: boolean;
  sourceType?: any;
  subject?: string;
  subjectId?: any;
  subjects?: any;
  text?: any;
  threadId?: number;
  threadTypeId?: number;
  toId?: number;
  toName?: string;
  updateDate?: string;
  updateDateMilliseconds?: number;
  userId?: any;
  wsTemplate?: any;
  wsTemplateId?: number;
}

export interface MessageStatusHistory {
  comments?: any;
  createDate?: string;
  createDateMilliseconds?: number;
  originator?: string;
  status?: string;
}

export interface Attachment {
  attachmentId?: number;
  fileName?: string;
  fileSize?: number;
  mimeType?: string;
  signed?: boolean;
}
