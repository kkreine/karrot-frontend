import { addHours, startOfYesterday } from 'date-fns'
import { range } from 'lodash'

import { convert } from '@/activities/api/activities'

import ActivityFeedbackItem from '@/activities/components/ActivityFeedbackItem.vue'

import {
  createActivity,
  createActivityType, createFeedback,
  createGroup,
  createPlace,
  createPlaceType,
  createUser,
  loginAs,
} from '>/mockBackend'
import { joinActivity, toResponse } from '>/mockBackend/activities'
import { addUserToGroup } from '>/mockBackend/groups'

const group = createGroup()
createPlaceType({ group: group.id })
const place = createPlace({ group: group.id })
const activityType = createActivityType({ group: group.id, hasFeedbackWeight: true })

const startDate = addHours(startOfYesterday(), 10)

const activity = createActivity({ startDate, place: place.id, activityType: activityType.id })
const canGiveFeedbackActivity = createActivity({ startDate, place: place.id, activityType: activityType.id })
const user = createUser()
addUserToGroup(user, group)

joinActivity(activity, user)
joinActivity(canGiveFeedbackActivity, user)

const otherUser = createUser()
addUserToGroup(otherUser, group)
joinActivity(activity, otherUser)

// add a couple of users that won't post feedback
range(2).forEach(() => {
  const user = createUser()
  addUserToGroup(user, group)
  joinActivity(activity, user)
  joinActivity(canGiveFeedbackActivity, user)
})

// and a dismissed feedback user
const dismissedUser = createUser()
addUserToGroup(dismissedUser, group)
joinActivity(activity, dismissedUser, { feedbackDismissed: true })

createFeedback({
  givenBy: otherUser.id,
  weight: 25.4,
  about: activity.id,
})

createFeedback({
  givenBy: user.id,
  weight: 102.1,
  about: activity.id,
})

loginAs(user)

export default {
  component: ActivityFeedbackItem,
}

export const Normal = {
  args: {
    activity: convert(toResponse(activity)),
  },
}

export const CanGiveFeedback = {
  args: {
    activity: convert(toResponse(canGiveFeedbackActivity)),
  },
}
