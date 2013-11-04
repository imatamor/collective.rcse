from zope import interface
from zope import schema
from zope import component
from z3c.form import button

from plone.autoform import directives as form
from plone.namedfile.field import NamedBlobImage
from plone.supermodel import model
from plone.uuid.interfaces import IUUID
from Products.CMFPlone.utils import getToolByName

from collective.transcode.star.interfaces import ITranscodeTool
from collective.rcse.i18n import _
from collective.rcse.content.group import get_group
from collective.rcse.page.controller import group_base
from collective.rcse.page.controller.navigationroot import NavigationRootBaseView
from collective.rcse.content.video import VideoSchema


CONTENT_TYPE = "collective.rcse.video"


class AddFormSchema(group_base.BaseAddFormSchema, VideoSchema):
    """Add form"""

    title = schema.TextLine(title=_(u"Title"))

    description = schema.Text(
        title=_(u"Description"),
        required=False
    )
    form.order_before(title='*')
    form.order_before(description='file')


class AddFormAdapter(object):
    interface.implements(AddFormSchema)
    component.adapts(interface.Interface)

    def __init__(self, context):
        self.context = context
        self.title = None
        self.description = ''
        self.file = None
        self.remoteUrl = None
        self.where = None
        group = get_group(context)
        if group:
            self.where = IUUID(group)


class AddForm(group_base.BaseAddForm):
    schema = AddFormSchema
    CONTENT_TYPE = CONTENT_TYPE
    msg_added = _(u"Video added")
    label = _(u"Add video")

    @button.buttonAndHandler(_(u"Add video"))
    def handleAdd(self, action):
        group_base.BaseAddForm.handleAdd(self, action)


class VideosView(group_base.BaseAddFormView):
    """A filterable blog view"""
    filter_type = [CONTENT_TYPE]
    form = AddForm

    def update(self):
        super(VideosView, self).update()
        self.tt = component.getUtility(ITranscodeTool)


class NavigationRootVideosView(VideosView, NavigationRootBaseView):
    def update(self):
        VideosView.update(self)
        NavigationRootBaseView.update(self)
