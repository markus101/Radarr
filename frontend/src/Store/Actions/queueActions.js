import _ from 'lodash';
import moment from 'moment';
import { createAction } from 'redux-actions';
import { batchActions } from 'redux-batched-actions';
import { sortDirections } from 'Helpers/Props';
import { createThunk, handleThunks } from 'Store/thunks';
import createAjaxRequest from 'Utilities/createAjaxRequest';
import serverSideCollectionHandlers from 'Utilities/serverSideCollectionHandlers';
import translate from 'Utilities/String/translate';
import { set, updateItem } from './baseActions';
import createFetchHandler from './Creators/createFetchHandler';
import createHandleActions from './Creators/createHandleActions';
import createServerSideCollectionHandlers from './Creators/createServerSideCollectionHandlers';
import createClearReducer from './Creators/Reducers/createClearReducer';
import createSetTableOptionReducer from './Creators/Reducers/createSetTableOptionReducer';

//
// Variables

export const section = 'queue';
const status = `${section}.status`;
const details = `${section}.details`;
const paged = `${section}.paged`;

//
// State

export const defaultState = {
  options: {
    includeUnknownMovieItems: true
  },

  status: {
    isFetching: false,
    isPopulated: false,
    error: null,
    item: {}
  },

  details: {
    isFetching: false,
    isPopulated: false,
    error: null,
    items: [],
    params: {}
  },

  paged: {
    isFetching: false,
    isPopulated: false,
    pageSize: 20,
    sortKey: 'timeleft',
    sortDirection: sortDirections.ASCENDING,
    error: null,
    items: [],
    isGrabbing: false,
    isRemoving: false,

    columns: [
      {
        name: 'status',
        columnLabel: translate('Status'),
        isSortable: true,
        isVisible: true,
        isModifiable: false
      },
      {
        name: 'movies.sortTitle',
        label: translate('Movie'),
        isSortable: true,
        isVisible: true
      },
      {
        name: 'languages',
        label: translate('Languages'),
        isSortable: true,
        isVisible: true
      },
      {
        name: 'quality',
        label: translate('Quality'),
        isSortable: true,
        isVisible: true
      },
      {
        name: 'customFormats',
        label: translate('Formats'),
        isSortable: false,
        isVisible: true
      },
      {
        name: 'protocol',
        label: translate('Protocol'),
        isSortable: true,
        isVisible: false
      },
      {
        name: 'indexer',
        label: translate('Indexer'),
        isSortable: true,
        isVisible: false
      },
      {
        name: 'downloadClient',
        label: translate('DownloadClient'),
        isSortable: true,
        isVisible: false
      },
      {
        name: 'size',
        label: translate('Size'),
        isSortable: true,
        isVisible: false
      },
      {
        name: 'title',
        label: translate('ReleaseTitle'),
        isSortable: true,
        isVisible: false
      },
      {
        name: 'year',
        label: translate('Year'),
        isSortable: true,
        isVisible: true
      },
      {
        name: 'outputPath',
        label: translate('OutputPath'),
        isSortable: false,
        isVisible: false
      },
      {
        name: 'estimatedCompletionTime',
        label: translate('Timeleft'),
        isSortable: true,
        isVisible: true
      },
      {
        name: 'progress',
        label: translate('Progress'),
        isSortable: true,
        isVisible: true
      },
      {
        name: 'actions',
        columnLabel: translate('Actions'),
        isVisible: true,
        isModifiable: false
      }
    ]
  },
  sortPredicates: {
    estimatedCompletionTime: function(item, direction) {
      return moment.duration(item.timeleft).asMilliseconds();
    }
  }
};

export const persistState = [
  'queue.options',
  'queue.paged.pageSize',
  'queue.paged.sortKey',
  'queue.paged.sortDirection',
  'queue.paged.columns'
];

//
// Helpers

function fetchDataAugmenter(getState, payload, data) {
  data.includeUnknownMovieItems = getState().queue.options.includeUnknownMovieItems;
}

//
// Actions Types

export const FETCH_QUEUE_STATUS = 'queue/fetchQueueStatus';

export const FETCH_QUEUE_DETAILS = 'queue/fetchQueueDetails';
export const CLEAR_QUEUE_DETAILS = 'queue/clearQueueDetails';

export const FETCH_QUEUE = 'queue/fetchQueue';
export const GOTO_FIRST_QUEUE_PAGE = 'queue/gotoQueueFirstPage';
export const GOTO_PREVIOUS_QUEUE_PAGE = 'queue/gotoQueuePreviousPage';
export const GOTO_NEXT_QUEUE_PAGE = 'queue/gotoQueueNextPage';
export const GOTO_LAST_QUEUE_PAGE = 'queue/gotoQueueLastPage';
export const GOTO_QUEUE_PAGE = 'queue/gotoQueuePage';
export const SET_QUEUE_SORT = 'queue/setQueueSort';
export const SET_QUEUE_TABLE_OPTION = 'queue/setQueueTableOption';
export const SET_QUEUE_OPTION = 'queue/setQueueOption';
export const CLEAR_QUEUE = 'queue/clearQueue';

export const GRAB_QUEUE_ITEM = 'queue/grabQueueItem';
export const GRAB_QUEUE_ITEMS = 'queue/grabQueueItems';
export const REMOVE_QUEUE_ITEM = 'queue/removeQueueItem';
export const REMOVE_QUEUE_ITEMS = 'queue/removeQueueItems';

//
// Action Creators

export const fetchQueueStatus = createThunk(FETCH_QUEUE_STATUS);

export const fetchQueueDetails = createThunk(FETCH_QUEUE_DETAILS);
export const clearQueueDetails = createAction(CLEAR_QUEUE_DETAILS);

export const fetchQueue = createThunk(FETCH_QUEUE);
export const gotoQueueFirstPage = createThunk(GOTO_FIRST_QUEUE_PAGE);
export const gotoQueuePreviousPage = createThunk(GOTO_PREVIOUS_QUEUE_PAGE);
export const gotoQueueNextPage = createThunk(GOTO_NEXT_QUEUE_PAGE);
export const gotoQueueLastPage = createThunk(GOTO_LAST_QUEUE_PAGE);
export const gotoQueuePage = createThunk(GOTO_QUEUE_PAGE);
export const setQueueSort = createThunk(SET_QUEUE_SORT);
export const setQueueTableOption = createAction(SET_QUEUE_TABLE_OPTION);
export const setQueueOption = createAction(SET_QUEUE_OPTION);
export const clearQueue = createAction(CLEAR_QUEUE);

export const grabQueueItem = createThunk(GRAB_QUEUE_ITEM);
export const grabQueueItems = createThunk(GRAB_QUEUE_ITEMS);
export const removeQueueItem = createThunk(REMOVE_QUEUE_ITEM);
export const removeQueueItems = createThunk(REMOVE_QUEUE_ITEMS);

//
// Helpers

const fetchQueueDetailsHelper = createFetchHandler(details, '/queue/details');

//
// Action Handlers

export const actionHandlers = handleThunks({

  [FETCH_QUEUE_STATUS]: createFetchHandler(status, '/queue/status'),

  [FETCH_QUEUE_DETAILS]: function(getState, payload, dispatch) {
    let params = payload;

    // If the payload params are empty try to get params from state.

    if (params && !_.isEmpty(params)) {
      dispatch(set({ section: details, params }));
    } else {
      params = getState().queue.details.params;
    }

    fetchQueueDetailsHelper(getState, params, dispatch);
  },

  ...createServerSideCollectionHandlers(
    paged,
    '/queue',
    fetchQueue,
    {
      [serverSideCollectionHandlers.FETCH]: FETCH_QUEUE,
      [serverSideCollectionHandlers.FIRST_PAGE]: GOTO_FIRST_QUEUE_PAGE,
      [serverSideCollectionHandlers.PREVIOUS_PAGE]: GOTO_PREVIOUS_QUEUE_PAGE,
      [serverSideCollectionHandlers.NEXT_PAGE]: GOTO_NEXT_QUEUE_PAGE,
      [serverSideCollectionHandlers.LAST_PAGE]: GOTO_LAST_QUEUE_PAGE,
      [serverSideCollectionHandlers.EXACT_PAGE]: GOTO_QUEUE_PAGE,
      [serverSideCollectionHandlers.SORT]: SET_QUEUE_SORT
    },
    fetchDataAugmenter
  ),

  [GRAB_QUEUE_ITEM]: function(getState, payload, dispatch) {
    const id = payload.id;

    dispatch(updateItem({ section: paged, id, isGrabbing: true }));

    const promise = createAjaxRequest({
      url: `/queue/grab/${id}`,
      method: 'POST'
    }).request;

    promise.done((data) => {
      dispatch(batchActions([
        fetchQueue(),

        set({
          section: paged,
          isGrabbing: false,
          grabError: null
        })
      ]));
    });

    promise.fail((xhr) => {
      dispatch(updateItem({
        section: paged,
        id,
        isGrabbing: false,
        grabError: xhr
      }));
    });
  },

  [GRAB_QUEUE_ITEMS]: function(getState, payload, dispatch) {
    const ids = payload.ids;

    dispatch(batchActions([
      ...ids.map((id) => {
        return updateItem({
          section: paged,
          id,
          isGrabbing: true
        });
      }),

      set({
        section: paged,
        isGrabbing: true
      })
    ]));

    const promise = createAjaxRequest({
      url: '/queue/grab/bulk',
      method: 'POST',
      dataType: 'json',
      data: JSON.stringify(payload)
    }).request;

    promise.done((data) => {
      dispatch(fetchQueue());

      dispatch(batchActions([
        ...ids.map((id) => {
          return updateItem({
            section: paged,
            id,
            isGrabbing: false,
            grabError: null
          });
        }),

        set({
          section: paged,
          isGrabbing: false,
          grabError: null
        })
      ]));
    });

    promise.fail((xhr) => {
      dispatch(batchActions([
        ...ids.map((id) => {
          return updateItem({
            section: paged,
            id,
            isGrabbing: false,
            grabError: null
          });
        }),

        set({ section: paged, isGrabbing: false })
      ]));
    });
  },

  [REMOVE_QUEUE_ITEM]: function(getState, payload, dispatch) {
    const {
      id,
      remove,
      blocklist
    } = payload;

    dispatch(updateItem({ section: paged, id, isRemoving: true }));

    const promise = createAjaxRequest({
      url: `/queue/${id}?removeFromClient=${remove}&blocklist=${blocklist}`,
      method: 'DELETE'
    }).request;

    promise.done((data) => {
      dispatch(fetchQueue());
    });

    promise.fail((xhr) => {
      dispatch(updateItem({ section: paged, id, isRemoving: false }));
    });
  },

  [REMOVE_QUEUE_ITEMS]: function(getState, payload, dispatch) {
    const {
      ids,
      remove,
      blocklist
    } = payload;

    dispatch(batchActions([
      ...ids.map((id) => {
        return updateItem({
          section: paged,
          id,
          isRemoving: true
        });
      }),

      set({ section: paged, isRemoving: true })
    ]));

    const promise = createAjaxRequest({
      url: `/queue/bulk?removeFromClient=${remove}&blocklist=${blocklist}`,
      method: 'DELETE',
      dataType: 'json',
      contentType: 'application/json',
      data: JSON.stringify({ ids })
    }).request;

    promise.done((data) => {
      // Don't use batchActions with thunks
      dispatch(fetchQueue());

      dispatch(set({ section: paged, isRemoving: false }));
    });

    promise.fail((xhr) => {
      dispatch(batchActions([
        ...ids.map((id) => {
          return updateItem({
            section: paged,
            id,
            isRemoving: false
          });
        }),

        set({ section: paged, isRemoving: false })
      ]));
    });
  }
});

//
// Reducers

export const reducers = createHandleActions({

  [CLEAR_QUEUE_DETAILS]: createClearReducer(details, defaultState.details),

  [SET_QUEUE_TABLE_OPTION]: createSetTableOptionReducer(paged),

  [SET_QUEUE_OPTION]: function(state, { payload }) {
    const queueOptions = state.options;

    return {
      ...state,
      options: {
        ...queueOptions,
        ...payload
      }
    };
  },

  [CLEAR_QUEUE]: createClearReducer(paged, {
    isFetching: false,
    isPopulated: false,
    error: null,
    items: [],
    totalPages: 0,
    totalRecords: 0
  })

}, defaultState, section);
