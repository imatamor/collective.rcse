from Acquisition import aq_inner
from collective.rcse.content.group import get_group
from collective.rcse import i18n
from collective.watcherlist.interfaces import IWatcherList
from plone.indexer import indexer
from Products.CMFCore.utils import getToolByName
from Products.Five.browser import BrowserView
from Products.statusmessages.interfaces import IStatusMessage
from zope import interface
from zope import component

"""
The global process of this is quite simple:
* You register yourself as watcher of a group
* Every content added/modified in that group will have watchers synchronized
* So to build 'My news' you just have to list every content where you are
  a watcher
"""


class IDisplayInMyNewsHelper(interface.Interface):
    """controller of the action"""
    def toggle_watching():
        """activate/desactivate watching of the current user on the current
        context"""
    def is_watching():
        """Return True if the current user is watching the context.
        Else, return False"""


class ToggleDisplayInMyNews(BrowserView):
    """Add the current user as watcher of the current group."""
    interface.implements(IDisplayInMyNewsHelper)

    def __init__(self, context, request):
        self.context = context
        self.request = request
        self.member = None
        self.catalog = None
        self.watchers = None

    def __call__(self):
        self.update()
        self.toggle_watching()
        if self.is_watching():
            msg = i18n.msg_watchers_add
        else:
            msg = i18n.msg_watchers_rm
        IStatusMessage(self.request).add(msg)
        self.request.response.redirect(self.context.absolute_url())

    def update(self):
        if self.member is None:
            memship = getToolByName(self.context, 'portal_membership', None)
            if memship is not None:
                self.member = memship.getAuthenticatedMember()
        if self.watchers is None:
            context = aq_inner(self.context)
            self.watchers = component.queryAdapter(
                context,
                interface=IWatcherList,
                name="group_watchers",
                default=None
            )
        if self.catalog is None:
            self.catalog = getToolByName(self.context, "portal_catalog")

    def toggle_watching(self):
        self.watchers.toggle_watching()
        self.reindex_last_items()

    def reindex_last_items(self):
        query = {}
        query["path"] = {
            "query": "/".join(self.context.getPhysicalPath()),
            "depth": 1,
        }
        query["sort_on"] = "modified"
        query["sort_order"] = "reverse"
        query["sort_limit"] = 5
        brains = self.catalog(**query)
        for brain in brains:
            brain.getObject().reindexObject(idxs=["group_watchers"])

    def is_watching(self):
        self.update()
        if self.watchers is None:
            return False
        return self.watchers.isWatching()


@indexer(interface.Interface)
def get_group_watchers(context):
    watchers = []
    context = aq_inner(context)
    group = context
    if hasattr(context, 'creators'):
        watchers.extend(context.creators)
    elif hasattr(context, 'Creators'):
        watchers.extend(context.Creators())

    if context.portal_type != "collective.rcse.group":
        group = get_group(context)
        watchers.extend(group.creators)
    if context.portal_type == "Discussion Item":
        return

    watcherlist = component.queryAdapter(
        group, interface=IWatcherList, name="group_watchers", default=None
    )

    if watcherlist:
        watchers.extend(watcherlist.watchers)
    watchers = tuple(set(watchers))
    return watchers