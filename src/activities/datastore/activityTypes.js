import activityTypes from '@/activities/api/activityTypes'
import { createMetaModule, indexById, metaStatusesWithId, withMeta } from '@/utils/datastore/helpers'
import i18n from '@/base/i18n'

function initialState () {
  return {
    entries: {},
  }
}

export default {
  namespaced: true,
  modules: { meta: createMetaModule() },
  state: initialState(),
  getters: {
    get: (state, getters) => activityTypeId => {
      return getters.enrich(state.entries[activityTypeId])
    },
    all: (state, getters) => Object.values(state.entries).map(getters.enrich),
    enrich: (state, getters) => activityType => {
      if (!activityType) return
      const { id, icon, feedbackIcon, name, nameIsTranslatable } = activityType
      // this corresponds to the name used by the activity type stylesheet plugin
      const colorName = `activity-type-${id}`
      const maybeTranslatedName = nameIsTranslatable ? i18n.t(`ACTIVITY_TYPE_NAMES.${name}`) : name
      return {
        ...activityType,
        colorName,
        iconProps: {
          name: icon,
          color: colorName,
          title: maybeTranslatedName,
        },
        feedbackIconProps: {
          name: feedbackIcon,
          color: colorName,
          title: maybeTranslatedName,
        },
        name: maybeTranslatedName,
        ...metaStatusesWithId(getters, ['save'], activityType.id),
      }
    },
    byCurrentGroup: (state, getters, rootState, rootGetters) => {
      return getters.all.filter(({ group }) => group === rootGetters['currentGroup/id'])
    },
  },
  actions: {
    ...withMeta({
      async fetch ({ commit }) {
        commit('update', await activityTypes.list())
      },
      async save ({ commit, dispatch }, activityType) {
        const data = await activityTypes.save(activityType)
        commit('update', [data])
      },
    }),
  },
  mutations: {
    clear (state) {
      Object.assign(state, initialState())
    },
    update (state, activityTypes) {
      state.entries = Object.freeze({ ...state.entries, ...indexById(activityTypes) })
    },
    delete (state, activityTypeId) {
      if (!state.entries[activityTypeId]) return
      const { [activityTypeId]: _, ...rest } = state.entries
      Object.freeze(rest)
      state.entries = rest
    },
  },
}

export function plugin (datastore) {
  datastore.watch((state, getters) => getters['auth/isLoggedIn'], isLoggedIn => {
    if (isLoggedIn) {
      datastore.dispatch('activityTypes/fetch')
    }
    else {
      datastore.dispatch('activityTypes/clear')
    }
  })
}