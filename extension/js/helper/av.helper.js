import AV from 'leancloud-storage'

export function setACL(instance) {
  const acl = new AV.ACL();

  acl.setPublicReadAccess(true);
  acl.setWriteAccess(AV.User.current(), true);

  instance.setACL(acl);
}