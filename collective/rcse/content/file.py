from plone.directives import form
from plone.namedfile.field import NamedBlobFile
from collective.rcse.i18n import RCSEMessageFactory

_ = RCSEMessageFactory


class FileSchema(form.Schema):
    """A conference session. Sessions are managed inside Programs.
    """

    file = NamedBlobFile(title=_(u"File"))
