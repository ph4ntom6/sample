import Sequelize from 'sequelize'
import { createClient } from '../config/redis'

import Code from './Code'
import User from './User'
import News from './News'
import Role from './Role'
import Bill from './Bill'
import Draft from './Draft'
import Alert from './Alert'
import Client from './Client'
import Token from './OAuthToken'
import Business from './Business'
import Industry from './Industry'
import Calendar from './Calendar'
import BillCode from './BillCode'
import DailyFile from './DailyFile'
import ReadAlert from './ReadAlerts'
import NewsSource from './NewsSource'
import Legislator from './Legislator'
import BillMotion from './BillMotion'
import BillHistory from './BillHistory'
import BillVersion from './BillVersion'
import VetoMessage from './VetoMessage'
import Conversation from './Conversation'
import BillAnalysis from './BillAnalysis'
import LocationCode from './LocationCode'
import BillTodaysLaw from './BillTodaysLaw'
import BillDetailVote from './BillDetailVote'
import RefreshToken from './OAuthRefreshToken'
import ClientScorecard from './ClientScorcard'
import BillSummaryVote from './BillSummaryVote'
import CommitteeAgenda from './CommitteeAgenda'
import NotificationLock from './NotificationLock'
import UserBillTracking from './UserBillTracking'
import CommitteeHearing from './CommitteeHearing'
import BillVersionAuthor from './BillVersionAuthor'
import ClientBillImpacts from './ClientBillImpacts'
import ConversationMessage from './ConversationMessage'
import ClientBillTracking from './ClientBillTracking'

const mysql = require('../config/database')

const sequelize = new Sequelize(
    mysql.database,
    mysql.username,
    mysql.password,
    mysql
)

/*
 * connect to the redis wait for the connection then proceed
 */
createClient()

export default sequelize
export const CodeModel = Code(sequelize, Sequelize.DataTypes)
export const BillCodeModel = BillCode(sequelize, Sequelize.DataTypes)

export const TokenModel = Token(sequelize, Sequelize.DataTypes)
export const BillMotionModel = BillMotion(sequelize, Sequelize.DataTypes)
export const BillHistoryModel = BillHistory(sequelize, Sequelize.DataTypes)

export const RefreshTokenModel = RefreshToken(sequelize, Sequelize.DataTypes)
export const BillDetailVoteModel = BillDetailVote(
    sequelize,
    Sequelize.DataTypes
)
export const CalendarModel = Calendar(sequelize, Sequelize.DataTypes)
export const LegislatorModel = Legislator(sequelize, Sequelize.DataTypes)
export const LocationCodeModel = LocationCode(sequelize, Sequelize.DataTypes)
export const CommitteeAgendaModel = CommitteeAgenda(
    sequelize,
    Sequelize.DataTypes
)
export const NewsModel = News(sequelize, Sequelize.DataTypes)
export const CommitteeHearingModel = CommitteeHearing(
    sequelize,
    Sequelize.DataTypes
)
export const NewsSourceModel = NewsSource(sequelize, Sequelize.DataTypes)
export const ConversationModel = Conversation(sequelize, Sequelize.DataTypes)

export const BillSummaryVoteModel = BillSummaryVote(
    sequelize,
    Sequelize.DataTypes
)
export const ConversationMessageModel = ConversationMessage(
    sequelize,
    Sequelize.DataTypes
)
export const BillTodaysLawModel = BillTodaysLaw(sequelize, Sequelize.DataTypes)
export const DailyFileModel = DailyFile(sequelize, Sequelize.DataTypes)
export const RoleModel = Role(sequelize, Sequelize.DataTypes)
export const BillVersionAuthorModel = BillVersionAuthor(
    sequelize,
    Sequelize.DataTypes
)
export const UserModel = User(sequelize, Sequelize.DataTypes)
export const BillVersionModel = BillVersion(sequelize, Sequelize.DataTypes)
export const VetoMessageModel = VetoMessage(sequelize, Sequelize.DataTypes)
export const BusinessModel = Business(sequelize, Sequelize.DataTypes)
export const IndustryModel = Industry(sequelize, Sequelize.DataTypes)
export const BillModel = Bill(sequelize, Sequelize.DataTypes)
export const DraftModel = Draft(sequelize, Sequelize.DataTypes)
export const BillAnalysisModel = BillAnalysis(sequelize, Sequelize.DataTypes)
export const AlertModel = Alert(sequelize, Sequelize.DataTypes)

export const ClientBillImpactsModel = ClientBillImpacts(
    sequelize,
    Sequelize.DataTypes
)
export const ClientBillTrackingModel = ClientBillTracking(
    sequelize,
    Sequelize.DataTypes
)
export const ClientModel = Client(sequelize, Sequelize.DataTypes)

export const ClientScorecardModel = ClientScorecard(
    sequelize,
    Sequelize.DataTypes
)
export const UserBillTrackingModel = UserBillTracking(
    sequelize,
    Sequelize.DataTypes
)
export const NotificationLockModel = NotificationLock(
    sequelize,
    Sequelize.DataTypes
)

export const ReadAlertModel = ReadAlert(sequelize, Sequelize.DataTypes)

BillModel.associateManually()
BillVersionModel.associateManually()
ClientBillImpactsModel.associateManually()
UserModel.associateManually()
BusinessModel.associateManually()
BillHistoryModel.associateManually()
AlertModel.associateManually()
ClientBillTrackingModel.associateManually()
