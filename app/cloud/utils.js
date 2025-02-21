function getStatusCode(status) {
  const reverseStatusMapping = {
    Open: 100,
    Assigned: 102,
    "In progress": 105,
    "In review": 200,
    Closed: 205,
    Paid: 300,
  };
  return reverseStatusMapping[status];
}

function areEqualArrays(array1, array2) {
  if (array1.length === array2.length) {
    return array1.every((element) => {
      if (array2.includes(element)) {
        return true;
      }

      return false;
    });
  }

  return false;
}
