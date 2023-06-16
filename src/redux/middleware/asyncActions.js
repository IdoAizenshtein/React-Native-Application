export default () => next => (action) => {
  const { async, auth, type, ...rest } = action

  if (!async) {return next(action)}

  const SUCCESS = `${type}_SUCCESS`
  const REQUEST = `${type}_REQUEST`
  const FAILURE = `${type}_FAILURE`

  next({
    ...rest,
    type: REQUEST,
  })

  return async
    .then(resp => {
      next({
        ...rest,
        resp,
        type: SUCCESS,
      })
      return resp
    })
    .catch(err => {
      next({
        ...rest,
        err: err,
        type: FAILURE,
      })
      throw err
    })
}
