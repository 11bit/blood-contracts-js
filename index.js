class Refined {
  constructor(value) {
    if (value instanceof Refined) {
      this.value = value.value;
    } else {
      this.value = value;
    }
  }
}

class ContractFailure {
  constructor(message) {
    if (message instanceof ContractFailure) {
      this.message = message.message;
    } else {
      this.message = message;
    }
  }
}

function Sum(a, b) {
  return Contract(value => {
    const resultA = a.match(value);

    if (resultA instanceof ContractFailure) {
      b.setContext(a.context);
      return b.match(value);
    }

    return resultA;
  });
}

function Pipe(a, b) {
  return Contract(value => {
    const resultA = a.match(value);
    if (resultA instanceof ContractFailure) {
      return resultA;
    }

    b.setContext(a.context);
    return b.match(value);
  });
}

function Contract(fn) {
  class ContractInst {
    match(value) {
      if (!this.context) {
        this.context = {};
      }

      const res = fn(value, this.context);

      if (!(res instanceof ContractFailure)) {
        return new Refined(res);
      }

      return res;
    }

    setContext(context = {}) {
      this.context = context;
    }

    or(contract) {
      return Sum(this, contract);
    }

    and(contract) {
      return Pipe(this, contract);
    }
  }

  return new ContractInst();
}

module.exports = {
  Refined,
  ContractFailure,
  Contract,
};
