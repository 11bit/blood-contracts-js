import test from 'ava';
import { Contract, ContractFailure } from './';

const Email = Contract((value, context) => {
  if (value !== 'hello@example.com') {
    return new ContractFailure('Wrong email or phone');
  }

  return value;
});

const ExampleEmail = Contract((value, context) => {
  if (!value.endsWith('@example.com')) {
    return new ContractFailure('Email is not in example com domain');
  }

  return value;
});

const HelloEmail = Contract((value, context) => {
  if (!value.startsWith('hello@')) {
    return new ContractFailure('Email is not for user hello');
  }

  return value;
});

const Phone = Contract((value, context) => {
  if (value !== '123456') {
    return new ContractFailure('Wrong email or phone');
  }

  return value;
});

test('simple success', t => {
  const email = Email.match('hello@example.com');

  t.is(email.value, 'hello@example.com');
  t.true(email instanceof Email);
});

test('simple error', t => {
  const email = Email.match('---');

  t.is(email.message, 'Wrong email or phone');
  t.true(email instanceof ContractFailure);
});

test('Types combination success', t => {
  const Login = Email.or(Phone);

  const login = Login.match('hello@example.com');

  t.is(login.value, 'hello@example.com');
  t.true(login instanceof Login);
});

test('Types combination success of the second contract', t => {
  const Login = Email.or(Phone);

  const login = Login.match('123456');

  t.is(login.value, '123456');
  t.true(login instanceof Login);
});

test('Types combination failure of second', t => {
  const Login = Email.or(Phone);

  const login = Login.match('---');

  t.is(login.message, 'Wrong email or phone');
  t.true(login instanceof ContractFailure);
});

test('Test pipe', t => {
  const Login = HelloEmail.and(ExampleEmail);

  const login = Login.match('hello@example.com');

  t.is(login.value, 'hello@example.com');
  t.true(login instanceof Login);
});

test('Test pipe failure', t => {
  const Login = HelloEmail.and(ExampleEmail);

  const login = Login.match('frfr@example.com');

  t.is(login.message, 'Email is not for user hello');
  t.true(login instanceof ContractFailure);
});

test('Test pipe failure 2', t => {
  const Login = HelloEmail.and(ExampleEmail);

  const login = Login.match('hello@example.zz');

  t.is(login.message, 'Email is not in example com domain');
});

test('Test pipe passing context', t => {
  const A = Contract((value, context) => {
    context.a = 'contract a';
  });

  const B = Contract((value, context) => {
    context.b = 'contract b';
    t.is(context.a, 'contract a');
  });

  const C = Contract((value, context) => {
    t.is(context.a, undefined);
    t.is(context.b, undefined);
  });

  A.and(B).match('some val');

  C.match('some otner');
});

test('Test sum passing context', t => {
  const A = Contract((value, context) => {
    context.a = 'contract a';

    return new ContractFailure('contract A failed');
  });

  const B = Contract((value, context) => {
    t.is(context.a, 'contract a');
  });

  A.or(B).match('some val');
});

test('Test sum multiple', t => {
  const A = Contract((value, context) => {
    context.a = 'contract a';

    return new ContractFailure('contract A failed');
  });

  const B = Contract((value, context) => {
    t.is(context.a, 'contract a');
    context.b = 'contract b';

    return new ContractFailure('contract B failed');
  });

  const C = Contract((value, context) => {
    t.is(context.a, 'contract a');
    t.is(context.b, 'contract b');
  });

  A.or(B)
    .or(C)
    .match('some val');
});

test('Test real error', t => {
  const A = Contract((value, context) => {
    context.a = 'contract a';

    undefined.doSomethingWrong();
  });

  const res = A.match('some');

  t.true(res instanceof ContractFailure);
});
