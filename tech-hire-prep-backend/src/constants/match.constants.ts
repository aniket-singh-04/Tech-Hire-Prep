
/* -------------------------------------------------------------------------- */
/*                            Queue Configuration                             */
/* -------------------------------------------------------------------------- */

export const MATCH_QUEUE = {
  MAX_WAIT_TIME_MINUTES: 20,
  REQUEST_EXPIRY_MINUTES: 60,
  DEFAULT_ESTIMATED_WAIT_SECONDS: 10,
} as const;

/* -------------------------------------------------------------------------- */
/*                           Matching Configuration                           */
/* -------------------------------------------------------------------------- */

export const MATCHING = {
  MAX_ROLE_DISTANCE: 1,
  MAX_EXPERIENCE_GAP: 1,
  MAX_QUEUE_SIZE: 1000,
} as const;

/* -------------------------------------------------------------------------- */
/*                            Session Defaults                                */
/* -------------------------------------------------------------------------- */

export const MATCH_DEFAULTS = {
  DURATION_MINUTES: 60,
  QUEUE_POSITION_UNKNOWN: -1,
} as const;

/* -------------------------------------------------------------------------- */
/*                                Redis Keys                                  */
/* -------------------------------------------------------------------------- */

export const REDIS_KEYS = {
  MATCH_QUEUE: "match:queue",
  ACTIVE_REQUEST: "match:active-request",
  MATCH_RESULT: "match:result",
} as const;