const { Auth } = require('../../models');
const { doSetupAndTearDown, checkMatch, clearModel } = require('../utils');
describe.skip('Auth Module', () => {
  const member = {
    fullname: 'Jack Bauer',
    pjno: 11111,
    email: 'jack.Bauer@court.go.ke',
    office: 'my office',
    password: 'p@&&w0rd',
  };
  const searchPjno = async (user) => {
    return await Auth.findByPjno(user);
  };
  doSetupAndTearDown();
  afterAll(async () => {
    await clearModel(Auth);
  });
  it('Creates a new Member', async () => {
    const res = await Auth.createOne(member);
    expect(checkMatch(member.password, res.password)).toBeTruthy();
  });
  it('creates additional of n test Members', async () => {
    let n = 10;
    const ref = {
      fullname: 'Jack Bauer',
      pjno: 11111,
      email: 'jack.Bauer@court.go.ke',
      office: 'my office',
      password: 'p@&&w0rd',
    };
    const members = createNMembers(ref, n);
    for (let i = 0; i < members.length; i++) {
      await Auth.createOne(members[i]);
    }
    const sizeOfModel = await Auth.countDocuments({}).exec();
    expect(sizeOfModel).toEqual(n + 1);
  });

  it('finds registered user by Email', async () => {
    const res = await Auth.findByEmail(member.email);
    expect(res.email).toMatch(member.email);
  });
  it('finds registered user by pjno', async () => {
    const res = await searchPjno(member.pjno);
    expect(res.pjno).toEqual(member.pjno);
  });
  it('fails to find unregistered user', async () => {
    const res = await searchPjno('00000');
    expect(res).toBeNull();
  });
  it('finds one for Credentials', async () => {
    const isPresent = await Auth.findOneForCredentials(member);
    expect(isPresent).toBeTruthy();
  });
  it('return null for empty / invalid fields entry', async () => {
    const invalid = {
      pjno: '',
      email: 'jack.Bauer@court.go.ke',
    };
    const isNull = await Auth.findOneForCredentials(invalid);
    expect(isNull).toBeNull();
  });
  it('return null for incorrect credentials', async () => {
    const inCorrect = {
      pjno: 11112,
      password: 'p@$$w0rd',
    };
    const incorrect = await Auth.findOneForCredentials(inCorrect);
    expect(incorrect).toBeNull();
  });
  it('deletes created member', async () => {
    const res = await searchPjno(member.pjno);
    await res.deleteMember();
    const deleted = await searchPjno(member.pjno);
    expect(deleted).toBeNull();
  });
});

function createNMembers(ref, n) {
  let members = [];
  for (let i = 1; i <= n; i++) {
    let obj = {};
    obj['fullname'] = ref.fullname;
    obj['pjno'] = ref.pjno + i;
    obj['email'] = `jack.Bauer${i}@court.go.ke`;
    obj['office'] = ref.office;
    obj['password'] = ref.password;
    members.push(obj);
  }
  return members;
}
