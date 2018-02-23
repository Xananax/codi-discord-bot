const merge_arrays = (...arrs) => arrs.reduce( ( prev, curr ) => prev.concat(curr) ) 

module.exports = { merge_arrays }
