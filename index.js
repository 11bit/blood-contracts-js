class RefinedType {}

class ContractFailure {
  constructor(message, context) {
    if (message instanceof ContractFailure) {
      this.message = message.message;
    } else {
      this.message = message;
    }

    this.context = context;
  }
}

function Sum(A, B) {
  return Contract((value, context) => {
    const a = new A(context);
    const resultA = a.match(value);

    if (resultA instanceof ContractFailure) {
      const b = new B(context);
      return b.match(value);
    }

    return resultA;
  });
}

function Pipe(A, B) {
  return Contract((value, context) => {
    const a = new A(context);
    const resultA = a.match(value);
    if (resultA instanceof ContractFailure) {
      return resultA;
    }

    const b = new B(context);
    return b.match(value);
  });
}

function Contract(fn) {
  class ContractInst extends RefinedType {
    static match(value) {
      const inst = new ContractInst();
      return inst.match(value);
    }

    constructor(context = {}) {
      super();
      this.context = context;
    }

    match(value) {
      const res = fn(value, this.context);

      if (res instanceof ContractFailure) {
        return res;
      }

      this.setValue(res);
      return this;
    }

    setValue(val) {
      if (val instanceof RefinedType) {
        this.value = val.value;
      } else {
        this.value = val;
      }
    }

    setContext(context = {}) {
      this.context = context;
    }

    static or(contract) {
      return Sum(ContractInst, contract);
    }

    static and(contract) {
      return Pipe(ContractInst, contract);
    }
  }

  return ContractInst;
}

module.exports = {
  ContractFailure,
  Contract,
};
