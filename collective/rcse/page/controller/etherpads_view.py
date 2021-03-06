from z3c.form import button
from zope import interface
from zope import schema
from zope import component

from collective.rcse.i18n import _
from collective.rcse.page.controller import group_base
from collective.rcse.page.controller.navigationroot import \
    NavigationRootBaseView

CONTENT_TYPE = 'collective.rcse.etherpad'


class AddFormSchema(group_base.BaseAddFormSchema):
    """Add form"""
    title = schema.TextLine(title=_(u"Title"))
    description = schema.Text(
        title=_(u"Description"),
        required=False
    )


class AddFormAdapter(group_base.BaseAddFormAdapter):
    interface.implements(AddFormSchema)
    component.adapts(interface.Interface)

    def __init__(self, context):
        group_base.BaseAddFormAdapter.__init__(self, context)
        self.title = None
        self.description = ''


class AddForm(group_base.BaseAddForm):
    schema = AddFormSchema
    msg_added = _(u"Etherpad added")
    label = _(u"Add Etherpad")
    CONTENT_TYPE = CONTENT_TYPE

    @button.buttonAndHandler(_(u"Add etherpad"))
    def handleAdd(self, action):
        group_base.BaseAddForm.handleAdd(self, action)


class EtherpadsView(group_base.BaseAddFormView):
    """A filterable timeline"""
    filter_type = [CONTENT_TYPE]
    form = AddForm


class NavigationRootEtherpadsView(EtherpadsView, NavigationRootBaseView):
    def update(self):
        EtherpadsView.update(self)
        NavigationRootBaseView.update(self)
